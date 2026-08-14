import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Company, CompanySector, CompanyStatus } from './company.entity';
import { AuditService } from '../audit/audit.service';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name) || 'entreprise';
    let slug = base;
    let counter = 1;
    // Évite les collisions de slug entre entreprises
    while (await this.companiesRepo.findOne({ where: { slug } })) {
      counter += 1;
      slug = `${base}-${counter}`;
    }
    return slug;
  }

  async create(data: DeepPartial<Company>, actorUserId?: string): Promise<Company> {
    if (!data.name || !data.tenantCode || !data.sector) {
      throw new BadRequestException('name, tenantCode et sector sont obligatoires');
    }
    if (!Object.values(CompanySector).includes(data.sector as CompanySector)) {
      throw new BadRequestException(
        `secteur invalide. Valeurs acceptées : ${Object.values(CompanySector).join(', ')}`,
      );
    }
    const existingTenant = await this.companiesRepo.findOne({ where: { tenantCode: data.tenantCode as string } });
    if (existingTenant) {
      throw new BadRequestException('Ce tenantCode est déjà utilisé par une autre entreprise');
    }
    const slug = await this.generateUniqueSlug(data.name);
    const company = this.companiesRepo.create({ ...data, slug });
    const saved = await this.companiesRepo.save(company);
    await this.auditService.log({
      actorUserId,
      companyId: saved.id,
      action: 'CREATE_COMPANY',
      newValue: { name: saved.name, sector: saved.sector, tenantCode: saved.tenantCode, slug },
    });
    return saved;
  }

  async update(id: string, data: DeepPartial<Company>, actorUserId?: string): Promise<Company> {
    const before = await this.findOne(id);
    if (data.sector && !Object.values(CompanySector).includes(data.sector as CompanySector)) {
      throw new BadRequestException(
        `secteur invalide. Valeurs acceptées : ${Object.values(CompanySector).join(', ')}`,
      );
    }
    if (data.name !== undefined && !data.name) {
      throw new BadRequestException('Le nom ne peut pas être vide');
    }
    // Le statut ne se change jamais via update() générique — uniquement via
    // activate/deactivate/archive/restore, qui journalisent une action dédiée.
    delete (data as any).status;
    await this.companiesRepo.save({ id, ...data });
    const after = await this.findOne(id);
    await this.auditService.log({
      actorUserId,
      companyId: id,
      action: 'UPDATE_COMPANY',
      oldValue: this.snapshotForAudit(before),
      newValue: this.snapshotForAudit(after),
    });
    return after;
  }

  private snapshotForAudit(c: Company) {
    return {
      name: c.name,
      status: c.status,
      sector: c.sector,
      phone: c.phone,
      email: c.email,
      address: c.address,
      city: c.city,
      country: c.country,
    };
  }

  private async transitionStatus(
    id: string,
    newStatus: CompanyStatus,
    action: string,
    actorUserId?: string,
  ): Promise<Company> {
    const before = await this.findOne(id);
    await this.companiesRepo.update(id, { status: newStatus });
    await this.auditService.log({
      actorUserId,
      companyId: id,
      action,
      oldValue: { status: before.status },
      newValue: { status: newStatus },
    });
    return this.findOne(id);
  }

  activate(id: string, actorUserId?: string) {
    return this.transitionStatus(id, CompanyStatus.ACTIVE, 'ACTIVATE_COMPANY', actorUserId);
  }

  deactivate(id: string, actorUserId?: string) {
    return this.transitionStatus(id, CompanyStatus.INACTIVE, 'DEACTIVATE_COMPANY', actorUserId);
  }

  archive(id: string, actorUserId?: string) {
    return this.transitionStatus(id, CompanyStatus.ARCHIVED, 'ARCHIVE_COMPANY', actorUserId);
  }

  restore(id: string, actorUserId?: string) {
    return this.transitionStatus(id, CompanyStatus.ACTIVE, 'RESTORE_COMPANY', actorUserId);
  }
}
