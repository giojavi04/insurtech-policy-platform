import { ErrorCode } from './error-codes';

/** Cuerpo de Problem Details estilo RFC 7807 devuelto por cada respuesta de error del backend. */
export interface ProblemDetailsFieldError {
  field: string;
  message: string;
}

export interface ProblemDetailsBody {
  type?: string;
  title?: string;
  status: number;
  detail: string;
  code: string;
  instance?: string;
  errors?: ProblemDetailsFieldError[];
}

/** Error tipado que renderiza la UI — una sola forma sin importar qué endpoint haya fallado. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: ProblemDetailsFieldError[];

  constructor(body: ProblemDetailsBody) {
    super(body.detail);
    this.name = 'ApiError';
    this.status = body.status;
    this.code = body.code;
    this.fieldErrors = body.errors ?? [];
  }
}

const USER_MESSAGES: Partial<Record<string, string>> = {
  [ErrorCode.VALIDATION_FAILED]: 'Revisa los campos resaltados e intenta de nuevo.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Correo electrónico o contraseña incorrectos.',
  [ErrorCode.UNAUTHENTICATED]: 'Tu sesión expiró. Inicia sesión de nuevo.',
  [ErrorCode.QUOTE_NOT_FOUND]: 'No encontramos esa cotización.',
  [ErrorCode.POLICY_NOT_FOUND]: 'No encontramos esa póliza.',
  [ErrorCode.POLICY_ALREADY_ISSUED]: 'Ya se emitió una póliza para esta cotización.',
  [ErrorCode.INTERNAL_ERROR]: 'Ocurrió un error de nuestro lado. Intenta de nuevo.',
  NETWORK_ERROR: 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
};

/** Mapea un `code` de Problem Details a un mensaje legible por humanos que la UI pueda renderizar directamente. */
export function toUserMessage(error: ApiError): string {
  if (error.code === ErrorCode.CATALOG_VALUE_INVALID) {
    // El detalle del backend es texto en inglés generado en servidor (por
    // ejemplo, "Coverage 'PREMIUM' is not available for insurance type
    // 'HOGAR'."); no podemos tocar el backend, así que aquí mostramos un
    // mensaje genérico en español en su lugar.
    return 'Uno de los valores seleccionados no es válido para esta combinación.';
  }
  return USER_MESSAGES[error.code] ?? error.message ?? 'Ocurrió un error. Intenta de nuevo.';
}
