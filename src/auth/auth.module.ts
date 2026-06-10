import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { getJwtConfig } from 'src/config/jwt.config'
import { PrismaService } from 'src/prisma.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { EmailCodeService } from './email-code.service'
import { JwtStrategy } from './jwt.strategy'

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
	providers: [AuthService, EmailCodeService, JwtStrategy, PrismaService],
	exports: [AuthService, EmailCodeService, PrismaService]
})
export class AuthModule {}
