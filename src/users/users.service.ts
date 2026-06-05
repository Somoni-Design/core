import { BadRequestException, Injectable } from '@nestjs/common'
import { UserRole, UserStatus } from '@prisma/client'

import {
	ERROR_CODES,
	errorResponse
} from 'src/common/constants/errors.constant'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async approve(id: string, role: UserRole) {
		const user = await this.prisma.user.findUnique({
			where: { id }
		})

		if (!user) {
			throw new BadRequestException(errorResponse(ERROR_CODES.USER_NOT_FOUND))
		}

		if (user.status === UserStatus.BLOCKED) {
			throw new BadRequestException(errorResponse(ERROR_CODES.USER_BLOCKED))
		}

		return this.prisma.user.update({
			where: { id },
			data: {
				status: UserStatus.ACTIVE,
				role
			},
			select: {
				id: true,
				phone: true,
				fullName: true,
				role: true,
				status: true,
				isPhoneVerified: true,
				createdAt: true,
				updatedAt: true
			}
		})
	}
}
