import { BadRequestException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma.service'

import {
	ERROR_CODES,
	errorResponse
} from 'src/common/constants/errors.constant'

import { normalizePhone } from 'src/common/helpers/normalize-phone.helper'

@Injectable()
export class SmsCodeService {
	constructor(private readonly prisma: PrismaService) {}

	async sendCode(phoneRaw: string) {
		const phone = normalizePhone(phoneRaw)

		const code = this.generateCode()

		const codeHash = await bcrypt.hash(code, 10)

		await this.prisma.authCode.create({
			data: {
				phone,
				codeHash,
				expiresAt: new Date(Date.now() + 5 * 60 * 1000)
			}
		})

		console.log(`SMS code for ${phone}: ${code}`)

		return {
			message: 'Code sent successfully'
		}
	}

	async verify(phoneRaw: string, code: string) {
		const phone = normalizePhone(phoneRaw)

		const authCode = await this.prisma.authCode.findFirst({
			where: {
				phone,
				isUsed: false,
				expiresAt: {
					gt: new Date()
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		if (!authCode) {
			throw new BadRequestException(errorResponse(ERROR_CODES.CODE_EXPIRED))
		}

		if (authCode.attempts >= 5) {
			throw new BadRequestException(
				errorResponse(ERROR_CODES.TOO_MANY_ATTEMPTS)
			)
		}

		const isValidCode = await bcrypt.compare(code, authCode.codeHash)

		if (!isValidCode) {
			await this.prisma.authCode.update({
				where: {
					id: authCode.id
				},
				data: {
					attempts: {
						increment: 1
					}
				}
			})

			throw new BadRequestException(errorResponse(ERROR_CODES.INVALID_CODE))
		}

		await this.prisma.authCode.update({
			where: {
				id: authCode.id
			},
			data: {
				isUsed: true
			}
		})

		return phone
	}

	private generateCode(): string {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}
}
