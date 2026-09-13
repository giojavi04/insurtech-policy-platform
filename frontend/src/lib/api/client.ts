import { useAuthStore } from '../store/auth.store';
import { ApiError, type ProblemDetailsBody } from './problem-details';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface RequestOptions {
  /** Adjunta `Authorization: Bearer <token>` desde el almacén de autenticación. */
  auth?: boolean;
}

function isProblemDetailsBody(value: unknown): value is ProblemDetailsBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'detail' in value &&
    'status' in value
  );
}

async function request<T>(path: string, init: RequestInit, options: RequestOptions): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (options.auth) {
    const token = useAuthStore.getState().token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError({
      status: 0,
      detail: 'Could not reach the server. Check your connection and try again.',
      code: 'NETWORK_ERROR',
    });
  }

  const contentType = response.headers.get('content-type') ?? '';
  const hasJsonBody = contentType.includes('application/json') || contentType.includes('application/problem+json');
  const body = hasJsonBody ? await response.json() : undefined;

  if (!response.ok) {
    if (isProblemDetailsBody(body)) {
      throw new ApiError(body);
    }
    throw new ApiError({
      status: response.status,
      detail: response.statusText || 'Request failed.',
      code: 'UNKNOWN_ERROR',
    });
  }

  return body as T;
}

export const apiClient = {
  get: <T>(path: string, options: RequestOptions = {}): Promise<T> => request<T>(path, { method: 'GET' }, options),
  post: <T>(path: string, data: unknown, options: RequestOptions = {}): Promise<T> =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }, options),
};
