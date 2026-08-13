import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // Le payload devient request.user — inclut companyId pour l'isolation
  // multi-tenant et role pour les permissions.
  async validate(payload: { sub: string; role: string; companyId: string | null }) {
    return { userId: payload.sub, role: payload.role, companyId: payload.companyId };
  }
}
