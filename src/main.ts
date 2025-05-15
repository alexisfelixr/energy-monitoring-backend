// import './utils/crypto-polyfill';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors();
  
  // Configuración de validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Energy Monitoring API')
    .setDescription('API para el monitoreo de energía')
    .setVersion('1.0')
    .addTag('Centros')
    .addTag('Areas')
    .addTag('Sensores')
    .addTag('Mediciones')
    .addTag('Auth')
    .addTag('Generadores')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);

  console.log(`Application is running on: ${process.env.HOST}:${process.env.PORT }`);
  console.log(`Swagger is running on: ${process.env.HOST}:${process.env.PORT }/api/docs`);
}
bootstrap();
