import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
// NOTE: AuthController/AuthService (login, register, gestion des utilisateurs
// et des rôles) seront implémentés en Phase 3, conformément à la roadmap.
export class AuthModule {}
