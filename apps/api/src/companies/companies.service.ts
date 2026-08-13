import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Company, CompanyStatus } from './company.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
    private readonly auditService: AuditService,
  ) {}

  findAll(): Promise<Company[]> {
    return this.companiesRepo.find();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Entreprise introuvable');
    return company;
  }

  async create(data: DeepPartial<Company>, actorUserId?: string): Promise<Company> {
    const company = this.companiesRepo.create(data);
    const saved = await this.companiesRepo.save(company);
    await this.auditService.log({
      actorUserId,
      companyId: saved.id,
      action: 'CREATE_COMPANY',
      newValue: { name: saved.name, sector: saved.sector, tenantCode: saved.tenantCode },
    });
    return saved;
  }

  async update(id: string, data: DeepPartial<Company>, actorUserId?: string): Promise<Company> {
    const before = await this.findOne(id);
    await this.companiesRepo.save({ id, ...data });
    const after = await this.findOne(id);
    await this.auditService.log({
      actorUserId,
      companyId: id,
      action: 'UPDATE_COMPANY',
      oldValue: { name: before.name, status: before.status },
      newValue: { name: after.name, status: after.status },
    });
    return after;
  }

  async setStatus(id: string, status: CompanyStatus, actorUserId?: string): Promise<Company> {
    const before = await this.findOne(id);
    await this.companiesRepo.update(id, { status });
    await this.auditService.log({
      actorUserId,
      companyId: id,
      action: 'CHANGE_COMPANY_STATUS',
      oldValue: { status: before.status },
      newValue: { status },
    });
    return this.findOne(id);
  }
}
