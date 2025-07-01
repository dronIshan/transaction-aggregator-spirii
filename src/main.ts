import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Transaction Aggregator')
    .setDescription('Aggregates user game transaction stats')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Listening on http://localhost:3000`);
  console.log(`📖 Swagger ui u can access here : http://localhost:3000/api-docs`);

}
bootstrap();
