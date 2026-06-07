import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ApartmentController } from './apartment.controller'
import { ApartmentService } from './apartment.service'

@Module({
	controllers: [ApartmentController],
	providers: [ApartmentService, PrismaService]
})
export class ApartmentModule {}
