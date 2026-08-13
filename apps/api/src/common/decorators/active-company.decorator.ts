import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Entreprise active résolue et vérifiée par CompanyContextGuard
// (request.activeCompanyId) — jamais lue directement depuis l'en-tête
// par les contrôleurs.
export const ActiveCompanyId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.activeCompanyId as string | undefined;
});
