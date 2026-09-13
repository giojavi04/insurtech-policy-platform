import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Lo que devuelva aquí pasa a ser `req.user`. Tokens malformados,
  // alterados o expirados nunca llegan aquí; passport-jwt los rechaza
  // primero, y JwtAuthGuard los convierte en 401 mediante el flujo
  // predeterminado de AuthGuard de Nest.
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
