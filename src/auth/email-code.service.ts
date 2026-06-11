import { BadRequestException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import { PrismaService } from 'src/prisma.service'

import {
	ERROR_CODES,
	errorResponse
} from 'src/common/constants/errors.constant'

@Injectable()
export class EmailCodeService {
	constructor(private readonly prisma: PrismaService) {}

	async sendCode(emailRaw: string) {
		const email = emailRaw.toLowerCase().trim()

		const code = this.generateCode()
		const codeHash = await bcrypt.hash(code, 10)

		await this.prisma.authCode.create({
			data: {
				email,
				codeHash,
				expiresAt: new Date(Date.now() + 5 * 60 * 1000)
			}
		})

		await this.sendEmailCode(email, code)

		return {
			message: 'Code sent successfully'
		}
	}

	async verify(emailRaw: string, code: string) {
		const email = emailRaw.toLowerCase().trim()

		const authCode = await this.prisma.authCode.findFirst({
			where: {
				email,
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
				where: { id: authCode.id },
				data: {
					attempts: {
						increment: 1
					}
				}
			})

			throw new BadRequestException(errorResponse(ERROR_CODES.INVALID_CODE))
		}

		await this.prisma.authCode.update({
			where: { id: authCode.id },
			data: {
				isUsed: true
			}
		})

		return email
	}

	private async sendEmailCode(email: string, code: string) {
		const apiKey = process.env.BREVO_API_KEY
		const senderEmail =
			process.env.MAIL_FROM_EMAIL || 'noreply@somoni-design.tj'
		const senderName = process.env.MAIL_FROM_NAME || 'Somoni Design'

		if (!apiKey) {
			throw new Error('BREVO_API_KEY is not set')
		}

		const response = await fetch('https://api.brevo.com/v3/smtp/email', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'api-key': apiKey
			},
			body: JSON.stringify({
				sender: {
					name: senderName,
					email: senderEmail
				},
				to: [
					{
						email
					}
				],
				subject: 'Код подтверждения Somoni Design',
				htmlContent: `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
	</head>
	<body style="margin:0;padding:0;background:#f5f5f5;">
		<div style="
			max-width:600px;
			margin:40px auto;
			background:#ffffff;
			border-radius:16px;
			overflow:hidden;
			font-family:Arial,sans-serif;
		">
			<div style="
				background:#111827;
				padding:30px;
				text-align:center;
			">
				<h1 style="
					margin:0;
					color:#FBBF24;
					font-size:28px;
				">
					Somoni Design
				</h1>
			</div>

			<div style="padding:40px;">
				<h2 style="margin-top:0;">
					Подтверждение входа
				</h2>

				<p>
					Используйте код ниже для входа в систему:
				</p>

				<div style="
					text-align:center;
					margin:30px 0;
				">
					<div style="
						display:inline-block;
						padding:20px 40px;
						background:#111827;
						color:#FBBF24;
						font-size:36px;
						font-weight:bold;
						letter-spacing:8px;
						border-radius:12px;
					">
						${code}
					</div>
				</div>

				<p>
					Код действует 5 минут.
				</p>

				<p style="
					color:#6B7280;
					font-size:14px;
				">
					Если вы не запрашивали код, просто проигнорируйте это письмо.
				</p>
			</div>
		</div>
	</body>
	</html>
				`
			})
		})

		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(`Brevo API error: ${errorText}`)
		}
	}

	private generateCode(): string {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}
}
