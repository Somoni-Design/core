import { Body, Controller, Post } from '@nestjs/common'

import { AuthService } from './auth.service'

import { LoginDto } from './dto/login.dto'
import { SendCodeDto } from './dto/send-code.dto'
import { SetPasswordDto } from './dto/set-password.dto'
import { VerifyDto } from './dto/verify.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('send-code')
	sendCode(@Body() dto: SendCodeDto) {
		return this.authService.sendCode(dto)
	}

	@Post('verify')
	verify(@Body() dto: VerifyDto) {
		return this.authService.verify(dto)
	}

	@Post('set-password')
	setPassword(@Body() dto: SetPasswordDto) {
		return this.authService.setPassword(dto)
	}

	@Post('login')
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto)
	}
}
