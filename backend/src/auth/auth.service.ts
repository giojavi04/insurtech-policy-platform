import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from '../common/problem-details/error-code.enum';
import { UserRepository } from './user.repository';

// Se calcula una sola vez al cargar el módulo para que `bcrypt.compare`
// siempre tenga un hash real con el que comparar, incluso si el email es
// desconocido. Así se mantiene la forma de respuesta y, en esencia, el
// tiempo de respuesta idénticos en ambas ramas de fallo, para que la API
// no confirme ni descarte que un correo esté registrado.
const DUMMY_HASH = bcrypt.hashSync('no-such-user-placeholder', 10);

export interface LoginResult {
  accessToken: string;
  tokenType: 'Bearer';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);
    const isPasswordValid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException({
        code: ErrorCode.INVALID_CREDENTIALS,
        detail: 'Invalid email or password.',
      });
    }

    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email });
    return { accessToken, tokenType: 'Bearer' };
  }
}
