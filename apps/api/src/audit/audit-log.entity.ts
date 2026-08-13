import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // acteur = utilisateur humain OU agent IA (ex: "ai:travel_ai")
  @Index()
  @Column({ nullable: true })
  actorUserId: string;

  @Column({ nullable: true })
  actorLabel: string; // nom lisible de l'utilisateur ou de l'agent IA

  @Index()
  @Column({ nullable: true })
  companyId: string;

  @Column()
  action: string; // ex: UPDATE_USER, LOGIN, CREATE_COMPANY, AI_CREATE_TASK

  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, unknown>;

  @Column({ type: 'enum', enum: AuditResult, default: AuditResult.SUCCESS })
  result: AuditResult;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
