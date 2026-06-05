import {UserRole} from '@prisma/client'
import type { Request } from 'express'

export type JwtUser = {
	id: string
	phone: string
	role: UserRole
}

export type RequestWithUser = Request & {
	user: JwtUser
}
