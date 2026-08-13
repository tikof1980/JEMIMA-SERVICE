import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MembershipsService } from '../../memberships/memberships.service';

// Résout et vérifie l'entreprise active pour la requête à partir de
// l'en-tête X-Company-Id, en la confrontant à l'appartenance réelle en
// base — le frontend ne peut jamais imposer un company_id de confiance.
@Injectable()
export class CompanyContextGuard implements CanActivate {
  constructor(private readonly membershipsService: MembershipsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // Le Super Admin peut opérer sans contexte d'entreprise (vue globale)
    if (user.isSuperAdmin) return true;

    const companyId = request.headers['x-company-id'];
    if (!companyId) {
      throw new ForbiddenException('Entreprise active non spécifiée (en-tête X-Company-Id requis)');
    }

    const membership = await this.membershipsService.findOneForUserAndCompany(
      user.userId,
      companyId,
    );
    if (!membership) {
      throw new ForbiddenException("Accès refusé à cette entreprise");
    }

    request.membership = membership;
    request.activeCompanyId = companyId;
    return true;
  }
}
