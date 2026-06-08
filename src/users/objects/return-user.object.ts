import { Prisma } from '@prisma/client'

export const returnUserObject: Prisma.UserSelect = {
	id: true,
	createdAt: true,
	updatedAt: true,
	phone: true,
	fullName: true,
	role: true,
	status: true,
	isPhoneVerified: true
}
