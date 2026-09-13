import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorCode } from './common/problem-details/error-code.enum';
import { ProblemDetailsFilter } from './common/problem-details/problem-details.filter';
import { flattenValidationErrors } from './validation-error.util';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          code: ErrorCode.VALIDATION_FAILED,
          detail: 'One or more fields failed validation.',
          errors: flattenValidationErrors(errors),
        }),
    }),
  );

  app.useGlobalFilters(new ProblemDetailsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Insurtech Quote & Bind API')
    .setDescription('Catalogs, quoting, auth, and policy issuance — LibelulaSoft take-home.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  return app;
}

if (require.main === module) {
  bootstrap();
}

