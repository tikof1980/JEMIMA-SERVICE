import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditResult } from './audit-log.entity';

interface LogInput {
  actorUserId?: string;
  actorLabel?: string;
  companyId?: string;
  action: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  result?: AuditResult;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  // Point d'entrée unique pour journaliser une action sensible — utilisé
  // aussi bien par les contrôleurs humains que, plus tard, par JEMIMA AI CORE.
  async log(input: LogInput): Promise<void> {
    const entry = this.auditRepo.create({
      ...input,
      result: input.result || AuditResult.SUCCESS,
    });
    await this.auditRepo.save(entry);
  }

  findByCompany(companyId: string) {
    return this.auditRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
