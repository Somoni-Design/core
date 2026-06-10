import {
	BadRequestException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

import { PrismaService } from 'src/prisma.service'
import { EmailCodeService } from './email-code.service'

import { LoginDto } from './dto/login.dto'
import { SendCodeDto } from './dto/send-code.dto'
import { SetPasswordDto } from './dto/set-password.dto'
import { VerifyDto } from './dto/verify.dto'

import { AUTH_ACTIONS } from './constants/auth-actions.constant'

import {
	ERROR_CODES,
	errorResponse
} from 'src/common/constants/errors.constant'

type SetPasswordPayload = {
	sub: string
	type: 'set-password'
}

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly emailCodeService: EmailCodeService,
		private readonly jwtService: JwtService
	) {}

	async sendCode(dto: SendCodeDto) {
		return this.emailCodeService.sendCode(dto.email)
	}

	async verify(dto: VerifyDto) {
		const email = await this.emailCodeService.verify(dto.email, dto.code)

		const user = await this.prisma.user.findUnique({
			where: { email }
		})

		if (!user) {
			const createdUser = await this.prisma.user.create({
				data: {
					email,
					isEmailVerified: true,
					status: UserStatus.PENDING
				},
				select: {
					id: true,
					email: true,
					status: true
				}
			})

			return {
				action: AUTH_ACTIONS.WAIT_APPROVAL,
				user: createdUser
			}
		}

		if (user.status === UserStatus.PENDING) {
			return {
				action: AUTH_ACTIONS.WAIT_APPROVAL,
				user: {
					id: user.id,
					email: user.email,
					status: user.status
				}
			}
		}

		if (user.status === UserStatus.BLOCKED) {
			throw new BadRequestException(errorResponse(ERROR_CODES.USER_BLOCKED))
		}

		if (!user.passwordHash) {
			const token = this.jwtService.sign(
				{
					sub: user.id,
					type: 'set-password'
				},
				{
					expiresIn: '10m'
				}
			)

			return {
				action: AUTH_ACTIONS.SET_PASSWORD,
				token
			}
		}

		return {
			action: AUTH_ACTIONS.LOGIN_WITH_PASSWORD
		}
	}

	async setPassword(dto: SetPasswordDto) {
		let payload: SetPasswordPayload

		try {
			payload = this.jwtService.verify<SetPasswordPayload>(dto.token)
		} catch {
			throw new UnauthorizedException(
				errorResponse(ERROR_CODES.INVALID_CREDENTIALS)
			)
		}

		if (payload.type !== 'set-password') {
			throw new UnauthorizedException(
				errorResponse(ERROR_CODES.INVALID_CREDENTIALS)
			)
		}

		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub }
		})

		if (!user) {
			throw new BadRequestException(errorResponse(ERROR_CODES.USER_NOT_FOUND))
		}

		if (user.status !== UserStatus.ACTIVE || !user.role) {
			throw new BadRequestException(
				errorResponse(ERROR_CODES.ACCESS_NOT_GRANTED)
			)
		}

		if (user.passwordHash) {
			throw new BadRequestException(
				errorResponse(ERROR_CODES.PASSWORD_ALREADY_SET)
			)
		}

		const passwordHash = await bcrypt.hash(dto.password, 10)

		const updatedUser = await this.prisma.user.update({
			where: { id: user.id },
			data: { passwordHash }
		})

		return this.buildAuthResponse(updatedUser)
	}

	async login(dto: LoginDto) {
		const email = dto.email.toLowerCase().trim()

		const user = await this.prisma.user.findUnique({
			where: { email }
		})

		if (!user || !user.passwordHash) {
			throw new UnauthorizedException(
				errorResponse(ERROR_CODES.INVALID_CREDENTIALS)
			)
		}

		if (user.status === UserStatus.BLOCKED) {
			throw new UnauthorizedException(errorResponse(ERROR_CODES.USER_BLOCKED))
		}

		if (user.status !== UserStatus.ACTIVE || !user.role) {
			throw new UnauthorizedException(
				errorResponse(ERROR_CODES.ACCESS_NOT_GRANTED)
			)
		}

		const isValidPassword = await bcrypt.compare(
			dto.password,
			user.passwordHash
		)

		if (!isValidPassword) {
			throw new UnauthorizedException(
				errorResponse(ERROR_CODES.INVALID_CREDENTIALS)
			)
		}

		return this.buildAuthResponse(user)
	}

	private buildAuthResponse(user: User) {
		const accessToken = this.jwtService.sign({
			sub: user.id,
			email: user.email,
			role: user.role
		})

		return {
			accessToken,
			user: {
				id: user.id,
				email: user.email,
				phone: user.phone,
				fullName: user.fullName,
				role: user.role,
				status: user.status
			}
		}
	}
}
