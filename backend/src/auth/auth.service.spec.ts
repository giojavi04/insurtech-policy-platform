import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import type { UserRepository } from './user.repository';

describe('AuthService', () => {
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let service: AuthService;
  let seededHash: string;

  beforeEach(async () => {
    seededHash = await bcrypt.hash('correct-password', 10);
    userRepository = { findByEmail: vi.fn() } as unknown as UserRepository;
    jwtService = { signAsync: vi.fn().mockResolvedValue('signed.jwt.token') } as unknown as JwtService;
    service = new AuthService(userRepository, jwtService);
  });

  it('issues a JWT for the seeded user with the correct password', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: 'user-1',
      email: 'demo@libelulasoft.com',
      passwordHash: seededHash,
      createdAt: new Date(),
    } as never);

    const result = await service.login('demo@libelulasoft.com', 'correct-password');

    expect(result).toEqual({ accessToken: 'signed.jwt.token', tokenType: 'Bearer' });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'user-1', email: 'demo@libelulasoft.com' }),
    );
  });

  it('rejects a wrong password with 401 INVALID_CREDENTIALS', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: 'user-1',
      email: 'demo@libelulasoft.com',
      passwordHash: seededHash,
      createdAt: new Date(),
    } as never);

    await expect(service.login('demo@libelulasoft.com', 'wrong-password')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects an unknown email with the exact same error shape as a wrong password (no user enumeration)', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const unknownEmailRejection = service.login('nobody@example.com', 'anything');
    await expect(unknownEmailRejection).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(unknownEmailRejection).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'INVALID_CREDENTIALS' }),
    });

    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: 'user-1',
      email: 'demo@libelulasoft.com',
      passwordHash: seededHash,
      createdAt: new Date(),
    } as never);
    const wrongPasswordRejection = service.login('demo@libelulasoft.com', 'wrong-password');

    await expect(wrongPasswordRejection).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'INVALID_CREDENTIALS' }),
    });
  });
});
