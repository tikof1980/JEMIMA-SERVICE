import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Invitation, InvitationStatus } from './invitation.entity';
import { UsersService } from '../users/users.service';
import { MembershipsService } from '../memberships/memberships.service';
import { MembershipStatus } from '../memberships/membership.entity';
import * as bcrypt from 'bcrypt';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation) private readonly invitationsRepo: Repository<Invitation>,
    private readonly usersService: UsersService,
    private readonly membershipsService: MembershipsService,
  ) {}

  // Étape 1 : un OWNER/ADMIN autorisé crée l'invitation
  async invite(email: string, companyId: string, roleId: string, invitedByUserId: string) {
    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const invitation = this.invitationsRepo.create({
      email,
      company: { id: companyId } as any,
      role: { id: roleId } as any,
      tokenHash,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      invitedByUserId,
    });
    await this.invitationsRepo.save(invitation);

    // rawToken à transmettre via le service de notification (Phase 11).
    // Retourné ici uniquement pour les tests internes.
    return { invitation, rawToken };
  }

  // Étape 2 : l'invité accepte, crée son compte (ou se connecte) et est
  // automatiquement rattaché à la bonne entreprise avec le rôle prévu.
  async accept(rawToken: string, fullName: string, password: string) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const invitation = await this.invitationsRepo.findOne({
      where: { tokenHash, status: InvitationStatus.PENDING },
      relations: ['company', 'role'],
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new UnauthorizedException('Invitation invalide ou expirée');
    }

    let user = await this.usersService.findByEmail(invitation.email);
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 12);
      user = await this.usersService.create({
        email: invitation.email,
        passwordHash,
        fullName,
      });
    }

    await this.membershipsService.create({
      user: { id: user.id } as any,
      company: { id: invitation.company.id } as any,
      role: { id: invitation.role.id } as any,
      status: MembershipStatus.ACTIVE,
    });

    invitation.status = InvitationStatus.ACCEPTED;
    await this.invitationsRepo.save(invitation);

    return user;
  }

  async revoke(id: string): Promise<void> {
    const invitation = await this.invitationsRepo.findOne({ where: { id } });
    if (!invitation) throw new NotFoundException('Invitation introuvable');
    invitation.status = InvitationStatus.REVOKED;
    await this.invitationsRepo.save(invitation);
  }
}
