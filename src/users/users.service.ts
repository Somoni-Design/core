import {
	BadRequestException,
	ForbiddenException,
	Injectable
} from '@nestjs/common'
import { UserRole, UserStatus } from '@prisma/client'
import {
	ERROR_CODES,
	errorResponse
} from 'src/common/constants/errors.constant'
import { listResponse } from 'src/common/helpers/list-response.helper'
import { PrismaService } from 'src/prisma.service'

import { UpdateMeDto } from './dto/update-me.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { returnUserObject } from './objects/return-user.object'

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	private checkAdmin(role: UserRole | null) {
		if (role !== UserRole.ADMIN) {
			throw new ForbiddenException(errorResponse(ERROR_CODES.FORBIDDEN))
		}
	}

	async findMe(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: returnUserObject
		})

		if (!user) {
			throw new BadRequestException(errorResponse(ERROR_CODES.USER_NOT_FOUND))
		}

		return user
	}

	async findPending(adminRole: UserRole | null) {
		this.checkAdmin(adminRole)
		const users = await this.prisma.user.findMany({
			where: {
				status: UserStatus.PENDING
			},
			orderBy: {
				createdAt: 'desc'
			},
			select: returnUserObject
		})
		return listResponse(users, users.length)
	}

	async updateMe(id: string, dto: UpdateMeDto) {
		await this.findMe(id)

		return this.prisma.user.update({
			where: { id },
			data: {
				fullName: dto.fullName,
				phone: dto.phone
			},
			select: returnUserObject
		})
	}

	async updateByAdmin(
		adminId: string,
		adminRole: UserRole | null,
		userId: string,
		dto: UpdateUserDto
	) {
		this.checkAdmin(adminRole)

		const user = await this.prisma.user.findUnique({
			where: { id: userId }
		})

		if (!user) {
			throw new BadRequestException(errorResponse(ERROR_CODES.USER_NOT_FOUND))
		}

		if (dto.phone) {
			const phoneExists = await this.prisma.user.findFirst({
				where: {
					phone: dto.phone,
					NOT: {
						id: userId
					}
				}
			})

			if (phoneExists) {
				throw new BadRequestException(errorResponse(ERROR_CODES.PHONE_EXISTS))
			}
		}

		if (adminId === userId && dto.role && dto.role !== user.role) {
			throw new BadRequestException(
				errorResponse(ERROR_CODES.USER_ROLE_CHANGE_DENIED)
			)
		}

		return this.prisma.user.update({
			where: { id: userId },
			data: {
				fullName: dto.fullName,
				phone: dto.phone,
				role: dto.role,
				status: dto.status
			},
			select: returnUserObject
		})
	}

	async approve(adminRole: UserRole | null, id: string, role: UserRole) {
		this.checkAdmin(adminRole)
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
			select: returnUserObject
		})
	}
}
