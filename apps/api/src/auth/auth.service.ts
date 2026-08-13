import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { AuditResult } from '../audit/audit-log.entity';

const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async register(email: string, password: string, fullName: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Un compte existe déjà avec cet email');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.usersService.create({ email, passwordHash, fullName });

    await this.auditService.log({
      actorUserId: user.id,
      actorLabel: user.fullName,
      action: 'REGISTER',
      result: AuditResult.SUCCESS,
    });

    return this.issueTokenFor(user.id, user.isSuperAdmin);
  }

  async login(email: string, password: string, ipAddress?: string) {
    const user = await this.usersService.findByEmail(email);
    const genericError = 'Email ou mot de passe incorrect';

    if (!user || !user.isActive) {
      await this.auditService.log({
        action: 'LOGIN',
        result: AuditResult.FAILURE,
        newValue: { email },
        ipAddress,
      });
      throw new UnauthorizedException(genericError);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await this.auditService.log({
        actorUserId: user.id,
        action: 'LOGIN',
        result: AuditResult.FAILURE,
        ipAddress,
      });
      throw new UnauthorizedException(genericError);
    }

    await this.auditService.log({
      actorUserId: user.id,
      actorLabel: user.fullName,
      action: 'LOGIN',
      result: AuditResult.SUCCESS,
      ipAddress,
    });

    return this.issueTokenFor(user.id, user.isSuperAdmin);
  }

  private issueTokenFor(userId: string, isSuperAdmin: boolean) {
    const accessToken = this.jwtService.sign({
      sub: userId,
      isSuperAdmin,
    });
    return { accessToken };
  }

  // Ne révèle jamais si l'email existe ou non (évite l'énumération de comptes).
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await this.usersService.update(user.id, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    });

    await this.auditService.log({
      actorUserId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      result: AuditResult.SUCCESS,
    });

    // L'envoi réel de l'email (SendGrid/SMTP/etc.) sera branché en Phase 11
    // (Notifications). Pour l'instant, le token est disponible en base pour
    // les tests internes uniquement.
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const user = await this.usersService.findByResetTokenHash(tokenHash);

    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new UnauthorizedException('Lien de réinitialisation invalide ou expiré');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersService.update(user.id, {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });

    await this.auditService.log({
      actorUserId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      result: AuditResult.SUCCESS,
    });
  }
}
