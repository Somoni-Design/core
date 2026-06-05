import { UserRole } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class ApproveUserDto {
	@IsEnum(UserRole)
	role!: UserRole
}
