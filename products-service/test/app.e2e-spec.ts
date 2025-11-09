import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import axios, { AxiosResponse } from 'axios';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { AppModule } from '../src/app.module';

const REGION = 'us-east-1';
const ENDPOINT = 'http://localhost:4566';

const sqs = new AWS.SQS({
  region: REGION,
  endpoint: ENDPOINT,
  accessKeyId: 'test',
  secretAccessKey: 'test',
});

jest.setTimeout(60000);

interface Product {
  name: string;
  price: number;
}

interface CreatedProduct extends Product {
  id: number;
}

interface ProductMessage {
  event: string;
  data: Product;
}

describe('Integration (in-process): ProductsService → SQS', () => {
  let app: INestApplication;
  let serverUrl: string;
  let queueUrl: string;
  let httpServer: Server;

  beforeAll(async () => {
    const queueName = `test-queue-e2e-${Date.now()}`;
    const create = await sqs.createQueue({ QueueName: queueName }).promise();
    queueUrl = create.QueueUrl!;

    process.env.AWS_SQS_QUEUE_URL_TEST = queueUrl;
    process.env.AWS_SQS_ENDPOINT = ENDPOINT;
    process.env.AWS_REGION = REGION;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    httpServer = app.getHttpServer() as Server;
    const server = httpServer.listen(0);
    const addr = server.address() as AddressInfo;
    serverUrl = `http://127.0.0.1:${addr.port}`;
  });

  afterAll(async () => {
    await app?.close();
    httpServer?.close();
    if (queueUrl) {
      await sqs
        .deleteQueue({ QueueUrl: queueUrl })
        .promise()
        .catch(() => {});
    }
  });

  it('створює повідомлення в нашій тестовій черзі', async () => {
    const name = `InProc Product ${Date.now()}`;
    const product: Product = { name, price: 9.99 };

    const res: AxiosResponse<CreatedProduct> = await axios.post<CreatedProduct>(
      `${serverUrl}/products`,
      product,
    );

    expect(res.status).toBe(201);

    let messages: AWS.SQS.Message[] = [];
    for (let i = 0; i < 6; i++) {
      const out = await sqs
        .receiveMessage({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 10,
          VisibilityTimeout: 5,
        })
        .promise();
      if (out.Messages && out.Messages.length > 0) {
        messages = out.Messages;
        break;
      }
    }

    expect(messages.length).toBeGreaterThan(0);

    const body: ProductMessage = JSON.parse(
      messages[0].Body!,
    ) as ProductMessage;

    expect(body.event).toBe('product.created');
    expect(body.data.name).toBe(name);

    await sqs
      .deleteMessage({
        QueueUrl: queueUrl,
        ReceiptHandle: messages[0].ReceiptHandle!,
      })
      .promise();
  });
});
