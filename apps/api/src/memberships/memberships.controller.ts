import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyContextGuard } from '../common/guards/company-context.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActiveCompanyId } from '../common/decorators/active-company.decorator';
import { AuditService } from '../audit/audit.service';

@Controller('memberships')
@UseGuards(JwtAuthGuard, CompanyContextGuard, PermissionsGuard)
export class MembershipsController {
  constructor(
    private readonly membershipsService: MembershipsService,
    private readonly auditService: AuditService,
  ) {}

  // Changement de rôle d'un membre — nécessite users.update
  @RequirePermissions('users.update')
  @Patch(':id/role')
  async changeRole(
    @Param('id') id: string,
    @Body('roleId') roleId: string,
    @CurrentUser() currentUser: { userId: string },
    @ActiveCompanyId() companyId: string,
  ) {
    await this.membershipsService.changeRole(id, roleId);
    await this.auditService.log({
      actorUserId: currentUser.userId,
      companyId,
      action: 'CHANGE_MEMBER_ROLE',
      newValue: { membershipId: id, newRoleId: roleId },
    });
    return { success: true };
  }
}
