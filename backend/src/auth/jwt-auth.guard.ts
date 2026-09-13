import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorCode } from '../common/problem-details/error-code.enum';

/**
 * Se aplica solo por método de controlador en `POST /policies` y
 * `GET /policies/{id}`; nunca se registra globalmente, para que un guard
 * global mal configurado no rompa en silencio los contratos públicos de
 * catálogo y quote.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    // Tokens faltantes, malformados, alterados o expirados terminan aquí como
    // `user === false`. La especificación usa 401 de forma consistente para
    // cualquier fallo de autenticación, sin rama RBAC/403.
    if (err || !user) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHENTICATED,
        detail: 'A valid Bearer token is required.',
      });
    }
    return user;
  }
}
