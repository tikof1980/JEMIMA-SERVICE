import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership, MembershipStatus } from './membership.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipsRepo: Repository<Membership>,
  ) {}

  // Toutes les entreprises actives auxquelles cet utilisateur appartient —
  // sert à construire le sélecteur d'entreprise et à vérifier l'accès.
  findActiveForUser(userId: string): Promise<Membership[]> {
    return this.membershipsRepo.find({
      where: { user: { id: userId }, status: MembershipStatus.ACTIVE },
      relations: ['company', 'role'],
    });
  }

  // Vérifie qu'un utilisateur a bien un accès actif à une entreprise donnée.
  // Ne JAMAIS faire confiance à un company_id envoyé par le frontend sans
  // repasser par cette vérification côté serveur.
  findOneForUserAndCompany(userId: string, companyId: string): Promise<Membership | null> {
    return this.membershipsRepo.findOne({
      where: {
        user: { id: userId },
        company: { id: companyId },
        status: MembershipStatus.ACTIVE,
      },
      relations: ['company', 'role'],
    });
  }

  create(data: Partial<Membership>): Promise<Membership> {
    const membership = this.membershipsRepo.create(data);
    return this.membershipsRepo.save(membership);
  }

  async setStatus(id: string, status: MembershipStatus): Promise<void> {
    await this.membershipsRepo.update(id, { status });
  }

  async changeRole(id: string, roleId: string): Promise<void> {
    await this.membershipsRepo.update(id, { role: { id: roleId } as any });
  }
}
