import type { ErrorCode } from './error-code.enum';

export interface ProblemDetailsFieldError {
  field: string;
  message: string;
}

/** Problem Details estilo RFC 7807, uniforme para cada endpoint. */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: ErrorCode | string;
  instance: string;
  errors?: ProblemDetailsFieldError[];
}

/**
 * Forma aceptada como payload `response` de una `HttpException` lanzada para
 * que el filtro global la renderice tal cual. `detail` y `code` son
 * obligatorios; el resto se deriva.
 */
export interface ProblemDetailsPayload {
  code: ErrorCode | string;
  detail: string;
  errors?: ProblemDetailsFieldError[];
}
