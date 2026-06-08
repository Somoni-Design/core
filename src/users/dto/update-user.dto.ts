import { UserRole, UserStatus } from '@prisma/client'
import {
	IsEnum,
	IsOptional,
	IsPhoneNumber,
	IsString,
	MinLength
} from 'class-validator'

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	fullName?: string

	@IsOptional()
	@IsPhoneNumber()
	phone?: string

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole

	@IsOptional()
	@IsEnum(UserStatus)
	status?: UserStatus
}
