export enum ErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  CATALOG_VALUE_INVALID = 'CATALOG_VALUE_INVALID',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  QUOTE_NOT_FOUND = 'QUOTE_NOT_FOUND',
  POLICY_NOT_FOUND = 'POLICY_NOT_FOUND',
  POLICY_ALREADY_ISSUED = 'POLICY_ALREADY_ISSUED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export const ERROR_TITLES: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_FAILED]: 'Validation failed',
  [ErrorCode.CATALOG_VALUE_INVALID]: 'Catalog value invalid',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials',
  [ErrorCode.UNAUTHENTICATED]: 'Unauthenticated',
  [ErrorCode.QUOTE_NOT_FOUND]: 'Quote not found',
  [ErrorCode.POLICY_NOT_FOUND]: 'Policy not found',
  [ErrorCode.POLICY_ALREADY_ISSUED]: 'Policy already issued',
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
};

const STATUS_FALLBACK_CODE: Partial<Record<number, ErrorCode>> = {
  400: ErrorCode.VALIDATION_FAILED,
  401: ErrorCode.UNAUTHENTICATED,
  404: ErrorCode.QUOTE_NOT_FOUND,
  409: ErrorCode.POLICY_ALREADY_ISSUED,
};

export function fallbackCodeForStatus(status: number): ErrorCode {
  return STATUS_FALLBACK_CODE[status] ?? ErrorCode.INTERNAL_ERROR;
}

export function codeToSlug(code: string): string {
  return code.toLowerCase().replace(/_/g, '-');
}
