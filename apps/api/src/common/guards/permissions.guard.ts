import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RolesService } from '../../roles/roles.service';

// Vérifie que le rôle de l'utilisateur, dans l'entreprise active (résolue
// par CompanyContextGuard), possède bien les permissions requises.
// Toujours exécuté côté serveur — jamais uniquement côté frontend.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.isSuperAdmin) return true;

    const membership = request.membership;
    if (!membership) {
      throw new ForbiddenException('Contexte entreprise manquant');
    }

    const grantedCodes = await this.rolesService.getPermissionCodes(membership.role.id);
    const hasAll = required.every((code) => grantedCodes.includes(code));
    if (!hasAll) {
      throw new ForbiddenException('Permission insuffisante pour cette action');
    }
    return true;
  }
}
