import {
	BadRequestException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

import { PrismaService } from 'src/prisma.service'
import { SmsCodeService } from './sms-code.service'

import { LoginDto } from './dto/login.dto'
import { SendCodeDto } from './dto/send-code.dto'
import { SetPasswordDto } from './dto/set-password.dto'
import { VerifyDto } from './dto/verify.dto'

import { AUTH_ACTIONS } from './constants/auth-actions.constant'

import {
	ERROR_CODES,
	errorResponse
} from 'src/common/constants/errors.constant'

import { normalizePhone } from 'src/common/helpers/normalize-phone.helper'

type SetPasswordPayload = {
	sub: string
	type: 'set-password'
}

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly smsCodeService: SmsCodeService,
		private readonly jwtService: JwtService
	) {}

	async sendCode(dto: SendCodeDto) {
		return this.smsCodeService.sendCode(dto.phone)
	}

	async verify(dto: VerifyDto) {
		const phone = await this.smsCodeService.verify(dto.phone, dto.code)

		const user = await this.prisma.user.findUnique({
			where: { phone }
		})

		if (!user) {
			const createdUser = await this.prisma.user.create({
				data: {
					phone,
					isPhoneVerified: true,
					status: UserStatus.PENDING
				},
				select: {
					id: true,
					phone: true,
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
				action: AUTH_ACTIONS.WAIT_APPROVAL
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
		const phone = normalizePhone(dto.phone)

		const user = await this.prisma.user.findUnique({
			where: { phone }
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
			phone: user.phone,
			role: user.role
		})

		return {
			accessToken,
			user: {
				id: user.id,
				phone: user.phone,
				role: user.role,
				status: user.status
			}
		}
	}
}
