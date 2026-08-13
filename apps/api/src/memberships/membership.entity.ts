import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { Role } from '../roles/role.entity';

export enum MembershipStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  INVITED = 'invited', // en attente d'acceptation d'invitation
}

// Relation USER -> MEMBERSHIP -> COMPANY : un utilisateur peut appartenir
// à plusieurs entreprises, avec un rôle différent dans chacune.
@Entity('memberships')
@Unique(['user', 'company'])
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'enum', enum: MembershipStatus, default: MembershipStatus.ACTIVE })
  status: MembershipStatus;

  @CreateDateColumn()
  createdAt: Date;
}
