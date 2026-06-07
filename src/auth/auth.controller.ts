import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Res
} from '@nestjs/common'
import { Response } from 'express'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { SendCodeDto } from './dto/send-code.dto'
import { SetPasswordDto } from './dto/set-password.dto'
import { VerifyDto } from './dto/verify.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('send-code')
	@HttpCode(HttpStatus.OK)
	sendCode(@Body() dto: SendCodeDto) {
		return this.authService.sendCode(dto)
	}

	@Post('verify')
	@HttpCode(HttpStatus.OK)
	verify(@Body() dto: VerifyDto) {
		return this.authService.verify(dto)
	}

	@Post('set-password')
	@HttpCode(HttpStatus.OK)
	setPassword(@Body() dto: SetPasswordDto) {
		return this.authService.setPassword(dto)
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		const result = await this.authService.login(dto)

		res.cookie('accessToken', result.accessToken, {
			httpOnly: true,
			sameSite: 'lax',
			secure: false,
			maxAge: 7 * 24 * 60 * 60 * 1000
		})

		return result
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('accessToken')

		return {
			message: 'Вы успешно вышли'
		}
	}
}
