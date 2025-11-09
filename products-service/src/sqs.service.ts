import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class SqsService {
  private readonly sqs: AWS.SQS;
  private readonly queueUrl: string;

  constructor() {
    const endpoint = process.env.AWS_SQS_ENDPOINT;
    const region = process.env.AWS_REGION || 'us-east-1';

    const qUrl =
      process.env.AWS_SQS_QUEUE_URL_TEST ?? process.env.AWS_SQS_QUEUE_URL;

    if (!endpoint) {
      throw new Error('AWS_SQS_ENDPOINT is required');
    }
    if (!qUrl) {
      throw new Error(
        'AWS_SQS_QUEUE_URL or AWS_SQS_QUEUE_URL_TEST is required',
      );
    }

    this.sqs = new AWS.SQS({
      region,
      endpoint,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    });

    this.queueUrl = qUrl;
  }

  async sendMessage(event: string, data: unknown): Promise<void> {
    const payload = JSON.stringify({ event, data });
    let attempt = 0;
    while (attempt < 3) {
      try {
        await this.sqs
          .sendMessage({
            QueueUrl: this.queueUrl,
            MessageBody: payload,
          })
          .promise();
        return;
      } catch (err) {
        attempt++;
        console.warn(
          `[SQS] Send attempt ${attempt} failed:`,
          (err as Error).message,
        );
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    throw new Error('[SQS] Failed to send message after 3 attempts');
  }
}
