import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  private readonly sqs = new AWS.SQS({
    region: process.env.AWS_REGION!,
    endpoint: process.env.AWS_SQS_ENDPOINT!,
  });

  private readonly queueUrl = process.env.AWS_SQS_QUEUE_URL!;

  onModuleInit() {
    this.logger.log('Notifications Service started polling...');
    this.startPolling();
  }

  async startPolling() {
    console.log(this.queueUrl, 'queueUrl');
    while (true) {
      try {
        const messages = await this.sqs
          .receiveMessage({
            QueueUrl: this.queueUrl,
            WaitTimeSeconds: 10,
            MaxNumberOfMessages: 5,
          })
          .promise();

        if (messages.Messages) {
          for (const msg of messages.Messages) {
            this.logger.log('📩 ' + msg.Body);
            await this.sqs
              .deleteMessage({
                QueueUrl: this.queueUrl,
                ReceiptHandle: msg.ReceiptHandle!,
              })
              .promise();
          }
        }
      } catch (err) {
        this.logger.error('Polling error', err);
      }

      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
