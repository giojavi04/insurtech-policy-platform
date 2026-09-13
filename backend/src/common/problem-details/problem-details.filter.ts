import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import type { Request, Response } from 'express';
import { codeToSlug, ERROR_TITLES, ErrorCode, fallbackCodeForStatus } from './error-code.enum';
import type { ProblemDetails, ProblemDetailsPayload } from './problem-details.types';

const PROBLEM_TYPE_BASE = 'https://libelulasoft.local/problems';

function isProblemDetailsPayload(value: unknown): value is ProblemDetailsPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'detail' in value
  );
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, detail, errors } = this.resolve(exception);

    const body: ProblemDetails = {
      type: `${PROBLEM_TYPE_BASE}/${codeToSlug(code)}`,
      title: ERROR_TITLES[code as ErrorCode] ?? 'Error',
      status,
      detail,
      code,
      instance: request.url,
      ...(errors && errors.length > 0 ? { errors } : {}),
    };

    this.logger.error({
      service: 'insurtech-api',
      endpoint: `${request.method} ${request.url}`,
      code,
      status,
      // Excluido intencionalmente: password, accessToken y cabecera Authorization.
    });

    response.status(status).json(body);
  }

  private resolve(exception: unknown): {
    status: number;
    code: ErrorCode | string;
    detail: string;
    errors?: ProblemDetails['errors'];
  } {
    if (exception instanceof Prisma.PrismaClientKnownRequestError && exception.code === 'P2002') {
      // La única superficie con restricción única accesible desde la API pública
      // es Policy.quoteId (decisión de diseño D3): un segundo POST /policies
      // para el mismo quote compite con la base de datos y pierde, y eso se
      // mapea aquí a 409.
      return {
        status: HttpStatus.CONFLICT,
        code: ErrorCode.POLICY_ALREADY_ISSUED,
        detail: 'A policy has already been issued for this quote.',
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (isProblemDetailsPayload(response)) {
        return { status, code: response.code, detail: response.detail, errors: response.errors };
      }

      const detail =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] })?.message ?? exception.message);

      return {
        status,
        code: fallbackCodeForStatus(status),
        detail: Array.isArray(detail) ? detail.join('; ') : detail,
      };
    }

    // Error desconocido: nunca se revelan detalles internos al cliente.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_ERROR,
      detail: 'An unexpected error occurred.',
    };
  }
}
