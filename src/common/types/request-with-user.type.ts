import { UserRole } from '@prisma/client'

export type RequestWithUser = {
	user: {
		id: string
		role: UserRole
	}
}
