import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';

// Modification du catalogue de permissions d'un rôle système — action
// sensible réservée au Super Admin, systématiquement journalisée
// (cf. Phase 3, section 12 : "modification importante d'une permission").
@Controller('roles')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly auditService: AuditService,
  ) {}

  @Patch(':id/permissions/grant')
  async grant(
    @Param('id') roleId: string,
    @Body('permissionCode') permissionCode: string,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const role = await this.rolesService.findById(roleId);
    const changed = await this.rolesService.grantPermission(roleId, permissionCode);
    await this.auditService.log({
      actorUserId: currentUser.userId,
      action: 'GRANT_ROLE_PERMISSION',
      newValue: { roleId, roleName: role?.name, permissionCode, changed },
    });
    return { success: true, changed };
  }

  @Patch(':id/permissions/revoke')
  async revoke(
    @Param('id') roleId: string,
    @Body('permissionCode') permissionCode: string,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const role = await this.rolesService.findById(roleId);
    const changed = await this.rolesService.revokePermission(roleId, permissionCode);
    await this.auditService.log({
      actorUserId: currentUser.userId,
      action: 'REVOKE_ROLE_PERMISSION',
      oldValue: { roleId, roleName: role?.name, permissionCode },
      newValue: { changed },
    });
    return { success: true, changed };
  }
}
