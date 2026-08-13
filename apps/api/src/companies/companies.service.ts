import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyStatus } from './company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
  ) {}

  findAll(): Promise<Company[]> {
    return this.companiesRepo.find();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Entreprise introuvable');
    return company;
  }

  create(data: Partial<Company>): Promise<Company> {
    const company = this.companiesRepo.create(data);
    return this.companiesRepo.save(company);
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    await this.companiesRepo.update(id, data);
    return this.findOne(id);
  }

  async setStatus(id: string, status: CompanyStatus): Promise<Company> {
    await this.companiesRepo.update(id, { status });
    return this.findOne(id);
  }
}
