import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // This 'user' object is attached by your JwtAuthGuard
    return data ? request.user?.[data] : request.user;
  },
);
