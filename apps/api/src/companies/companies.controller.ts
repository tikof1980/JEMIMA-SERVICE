import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company, CompanyStatus } from './company.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { CompanyContextGuard } from '../common/guards/company-context.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MembershipsService } from '../memberships/memberships.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly membershipsService: MembershipsService,
  ) {}

  // Vue globale Super Admin (Command Center plateforme) — toutes les entreprises
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get()
  findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  // Création d'entreprise — réservée au Super Admin, cf. section 2
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  create(@Body() data: Partial<Company>, @CurrentUser() currentUser: { userId: string }): Promise<Company> {
    return this.companiesService.create(data, currentUser.userId);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body('status') status: CompanyStatus,
    @CurrentUser() currentUser: { userId: string },
  ): Promise<Company> {
    return this.companiesService.setStatus(id, status, currentUser.userId);
  }

  // Liste des entreprises de l'utilisateur connecté — alimente le sélecteur
  // d'entreprise du frontend (section 6)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myCompanies(@CurrentUser() currentUser: { userId: string }) {
    const memberships = await this.membershipsService.findActiveForUser(currentUser.userId);
    return memberships.map((m) => ({ id: m.company.id, name: m.company.name, role: m.role.name }));
  }

  // Accès à une entreprise précise — nécessite un contexte d'entreprise
  // valide (en-tête X-Company-Id) ET la permission company.view
  @UseGuards(JwtAuthGuard, CompanyContextGuard, PermissionsGuard)
  @RequirePermissions('company.view')
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, CompanyContextGuard, PermissionsGuard)
  @RequirePermissions('company.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Company>,
    @CurrentUser() currentUser: { userId: string },
  ): Promise<Company> {
    return this.companiesService.update(id, data, currentUser.userId);
  }
}
