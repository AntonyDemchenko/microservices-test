import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class SqsService {
  private readonly sqs = new AWS.SQS({ endpoint: process.env.AWS_SQS_URL });

  async sendMessage(event: string, data: any) {
    const queueUrl = process.env.AWS_SQS_URL;
    if (!queueUrl) {
      throw new Error('AWS_SQS_URL env is required for SQS messaging');
    }

    await this.sqs
      .sendMessage({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify({ event, data }),
      })
      .promise();
  }
}
