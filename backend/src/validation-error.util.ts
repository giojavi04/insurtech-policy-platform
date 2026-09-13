import type { ValidationError } from 'class-validator';
import type { ProblemDetailsFieldError } from './common/problem-details/problem-details.types';

/** Aplana el árbol anidado de `ValidationError` de Nest/class-validator en `{field, message}[]`. */
export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): ProblemDetailsFieldError[] {
  return errors.flatMap((error) => {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;
    const messages: ProblemDetailsFieldError[] = error.constraints
      ? Object.values(error.constraints).map((message) => ({ field: path, message }))
      : [];
    const children = error.children?.length ? flattenValidationErrors(error.children, path) : [];
    return [...messages, ...children];
  });
}
