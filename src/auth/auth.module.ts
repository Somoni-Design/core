import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { getJwtConfig } from 'src/config/jwt.config'
import { PrismaService } from 'src/prisma.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { SmsCodeService } from './sms-code.service'

@Module({
	imports: [
		ConfigModule,
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig
		})
	],
	controllers: [AuthController],
	providers: [AuthService, SmsCodeService, JwtStrategy, PrismaService],
	exports: [AuthService, SmsCodeService]
})
export class AuthModule {}
