import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Injecte request.user (rempli par JwtStrategy) dans un paramètre de contrôleur.
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
