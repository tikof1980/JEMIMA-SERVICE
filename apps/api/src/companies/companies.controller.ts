import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company, CompanyStatus } from './company.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { CompanyContextGuard } from '../common/guards/company-context.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActiveCompanyId } from '../common/decorators/active-company.decorator';
import { MembershipsService } from '../memberships/memberships.service';
import { MembershipStatus } from '../memberships/membership.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { AuditService } from '../audit/audit.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly membershipsService: MembershipsService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly auditService: AuditService,
  ) {}

  // Vue globale Super Admin (Command Center plateforme) — toutes les entreprises
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get()
  findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  // Création d'entreprise — réservée au Super Admin, cf. Phase 3 section 2.
  // Si ownerEmail est fourni et correspond à un compte existant, le
  // membership propriétaire est créé automatiquement.
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  async create(
    @Body() body: Partial<Company> & { ownerEmail?: string },
    @CurrentUser() currentUser: { userId: string },
  ): Promise<Company> {
    const { ownerEmail, ...data } = body;
    const company = await this.companiesService.create(data, currentUser.userId);

    if (ownerEmail) {
      const owner = await this.usersService.findByEmail(ownerEmail);
      if (owner) {
        const ownerRole = await this.rolesService.findByName('owner');
        if (ownerRole) {
          await this.membershipsService.create({
            user: { id: owner.id } as any,
            company: { id: company.id } as any,
            role: { id: ownerRole.id } as any,
            status: MembershipStatus.ACTIVE,
          });
          await this.auditService.log({
            actorUserId: currentUser.userId,
            companyId: company.id,
            action: 'ADD_COMPANY_MEMBER',
            newValue: { email: ownerEmail, role: 'owner' },
          });
        }
      }
    }

    return company;
  }

  // Liste des entreprises de l'utilisateur connecté — alimente le sélecteur
  // d'entreprise et le Command Center (section 5/6)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myCompanies(@CurrentUser() currentUser: { userId: string }) {
    const memberships = await this.membershipsService.findActiveForUser(currentUser.userId);
    return memberships.map((m) => ({
      id: m.company.id,
      name: m.company.name,
      slug: m.company.slug,
      sector: m.company.sector,
      status: m.company.status,
      logoUrl: m.company.logoUrl,
      role: m.role.name,
    }));
  }

  // Accès à une entreprise précise — nécessite un contexte d'entreprise
  // valide (en-tête X-Company-Id) ET la permission company.view.
  // Bloqué automatiquement si l'entreprise est inactive/archivée (Cas 5/6).
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

  // --- Cycle de vie de l'entreprise — réservé au Super Admin (cohérent avec
  // la création, également SA-only) : évite qu'un employé ou même un owner
  // ne se retrouve accidentellement bloqué hors de sa propre entreprise. ---

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post(':id/activate')
  activate(@Param('id') id: string, @CurrentUser() u: { userId: string }) {
    return this.companiesService.activate(id, u.userId);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post(':id/deactivate')
  deactivate(@Param('id') id: string, @CurrentUser() u: { userId: string }) {
    return this.companiesService.deactivate(id, u.userId);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() u: { userId: string }) {
    return this.companiesService.archive(id, u.userId);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post(':id/restore')
  restore(@Param('id') id: string, @CurrentUser() u: { userId: string }) {
    return this.companiesService.restore(id, u.userId);
  }

  // --- Membres de l'entreprise (section 13) ---

  @UseGuards(JwtAuthGuard, CompanyContextGuard, PermissionsGuard)
  @RequirePermissions('users.view')
  @Get(':id/members')
  async listMembers(@Param('id') id: string) {
    const memberships = await this.membershipsService.findByCompany(id);
    return memberships.map((m) => ({
      membershipId: m.id,
      userId: m.user.id,
      fullName: m.user.fullName,
      email: m.user.email,
      role: m.role.name,
      status: m.status,
    }));
  }

  // Ajout rapide d'un membre déjà inscrit sur JEMIMA SERVICE (le flux
  // d'invitation par email, pour un nouvel utilisateur, reste géré par le
  // module invitations créé en Phase 3).
  @UseGuards(JwtAuthGuard, CompanyContextGuard, PermissionsGuard)
  @RequirePermissions('users.create')
  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() body: { email: string; roleName: string },
    @CurrentUser() currentUser: { userId: string },
    @ActiveCompanyId() companyId: string,
  ) {
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      throw new NotFoundException("Aucun compte JEMIMA SERVICE n'existe avec cet email");
    }
    const role = await this.rolesService.findByName(body.roleName);
    if (!role) {
      throw new NotFoundException(`Rôle "${body.roleName}" introuvable`);
    }
    const membership = await this.membershipsService.create({
      user: { id: user.id } as any,
      company: { id } as any,
      role: { id: role.id } as any,
      status: MembershipStatus.ACTIVE,
    });
    await this.auditService.log({
      actorUserId: currentUser.userId,
      companyId,
      action: 'ADD_COMPANY_MEMBER',
      newValue: { email: body.email, role: body.roleName },
    });
    return membership;
  }

  @UseGuards(JwtAuthGuard, CompanyContextGuard, PermissionsGuard)
  @RequirePermissions('users.delete')
  @Delete(':id/members/:membershipId')
  async removeMember(
    @Param('membershipId') membershipId: string,
    @CurrentUser() currentUser: { userId: string },
    @ActiveCompanyId() companyId: string,
  ) {
    await this.membershipsService.setStatus(membershipId, MembershipStatus.DISABLED);
    await this.auditService.log({
      actorUserId: currentUser.userId,
      companyId,
      action: 'REMOVE_COMPANY_MEMBER',
      newValue: { membershipId },
    });
    return { success: true };
  }
}
