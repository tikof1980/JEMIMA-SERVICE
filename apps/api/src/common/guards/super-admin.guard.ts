import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

// Réserve l'accès au Super Admin de JEMIMA SERVICE (gestion globale des
// entreprises, cf. section 2 du cahier des charges Phase 3).
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user?.isSuperAdmin) {
      throw new ForbiddenException('Réservé au Super Admin');
    }
    return true;
  }
}
