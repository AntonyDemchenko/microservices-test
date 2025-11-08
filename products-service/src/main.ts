import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { register } from './metrics.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
