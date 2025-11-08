import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database.module';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { SqsService } from './sqs.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
  ],
  controllers: [AppController, ProductsController],
  providers: [AppService, ProductsService, SqsService],
})
export class AppModule {}
