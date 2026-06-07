import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

type JwtPayload = {
	sub: string
	phone: string
	role?: string
}

const cookieExtractor = (req: Request): string | null => {
	return req?.cookies?.accessToken || null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				cookieExtractor,
				ExtractJwt.fromAuthHeaderAsBearerToken()
			]),
			secretOrKey:
				configService.get<string>('JWT_ACCESS_SECRET') || 'access_secret_key'
		})
	}

	async validate(payload: JwtPayload) {
		return {
			id: payload.sub,
			phone: payload.phone,
			role: payload.role
		}
	}
}
