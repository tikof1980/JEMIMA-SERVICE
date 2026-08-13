import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyContextGuard } from '../common/guards/company-context.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActiveCompanyId } from '../common/decorators/active-company.decorator';
import { AuditService } from '../audit/audit.service';

@Controller('users')
@UseGuards(JwtAuthGuard, CompanyContextGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @RequirePermissions('users.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @RequirePermissions('users.update')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { fullName?: string; isActive?: boolean },
    @CurrentUser() currentUser: { userId: string },
    @ActiveCompanyId() companyId: string,
  ) {
    const before = await this.usersService.findById(id);
    const after = await this.usersService.update(id, data);

    // Journalisation dédiée quand l'action désactive un compte — action
    // sensible mise en évidence séparément dans l'audit log.
    const isDeactivation = before?.isActive === true && after?.isActive === false;
    await this.auditService.log({
      actorUserId: currentUser.userId,
      companyId,
      action: isDeactivation ? 'DEACTIVATE_USER' : 'UPDATE_USER',
      oldValue: { fullName: before?.fullName, isActive: before?.isActive },
      newValue: { fullName: after?.fullName, isActive: after?.isActive },
    });
    return after;
  }
}
