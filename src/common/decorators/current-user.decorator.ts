import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { RequestWithUser } from '../types/request-with-user.type'

export const CurrentUser = createParamDecorator(
	(_: unknown, ctx: ExecutionContext): RequestWithUser['user'] => {
		const request = ctx.switchToHttp().getRequest<RequestWithUser>()

		return request.user
	}
)
