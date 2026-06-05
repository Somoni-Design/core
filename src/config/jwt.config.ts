import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'

export const getJwtConfig = (
	configService: ConfigService
): JwtModuleOptions => ({
	secret: configService.get<string>('JWT_ACCESS_SECRET') || 'access_secret',
	signOptions: {
		expiresIn: configService.get<number>('ACCESS_TOKEN_EXPIRES_IN') || 900
	}
})
