import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'
import type { StringValue } from 'ms'

export const getJwtConfig = (
	configService: ConfigService
): JwtModuleOptions => {
	const expiresIn =
		configService.get<StringValue>('ACCESS_TOKEN_EXPIRES_IN') || '7d'

	return {
		secret:
			configService.get<string>('JWT_ACCESS_SECRET') || 'access_secret_key',
		signOptions: {
			expiresIn
		}
	}
}
