import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company, CompanyStatus } from './company.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // Réservé à la dirigeante (owner) — vue Command Center
  @Roles('owner')
  @Get()
  findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Roles('owner')
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @Roles('owner')
  @Post()
  create(@Body() data: Partial<Company>): Promise<Company> {
    return this.companiesService.create(data);
  }

  @Roles('owner')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Company>): Promise<Company> {
    return this.companiesService.update(id, data);
  }

  @Roles('owner')
  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body('status') status: CompanyStatus): Promise<Company> {
    return this.companiesService.setStatus(id, status);
  }
}
