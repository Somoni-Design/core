import { BadRequestException, Injectable } from '@nestjs/common'
import {
	ERROR_CODES,
	errorResponse
} from 'src/common/constants/errors.constant'
import { listResponse } from 'src/common/helpers/list-response.helper'
import { PrismaService } from 'src/prisma.service'
import { returnUserObject } from 'src/users/objects/return-user.object'
import { CreateApartmentDto } from './dto/create-apartment.dto'
import { UpdateApartmentDto } from './dto/update-apartment.dto'

@Injectable()
export class ApartmentService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, dto: CreateApartmentDto) {
		return this.prisma.apartment.create({
			data: {
				name: dto.name,
				supplierId: userId
			}
		})
	}

	async findAll() {
		const [list, count] = await this.prisma.$transaction([
			this.prisma.apartment.findMany({
				include: {
					supplier: {
						select: returnUserObject
					}
				},
				orderBy: {
					createdAt: 'desc'
				}
			}),
			this.prisma.apartment.count()
		])
		return listResponse(list, count)
	}

	async findBySupplierId(userId: string) {
		const [list, count] = await this.prisma.$transaction([
			this.prisma.apartment.findMany({
				where: {
					supplierId: userId
				},
				orderBy: {
					createdAt: 'desc'
				}
			}),
			this.prisma.apartment.count({
				where: {
					supplierId: userId
				}
			})
		])

		return listResponse(list, count)
	}

	async findOne(id: string) {
		const apartment = await this.prisma.apartment.findUnique({
			where: { id },
			include: {
				expenses: {
					orderBy: {
						spentAt: 'desc'
					}
				},
				supplier: {
					select: returnUserObject
				}
			}
		})

		if (!apartment) {
			throw new BadRequestException(
				errorResponse(ERROR_CODES.APARTMENT_NOT_FOUND)
			)
		}

		return apartment
	}

	async update(id: string, dto: UpdateApartmentDto) {
		await this.findOne(id)

		return this.prisma.apartment.update({
			where: { id },
			data: {
				name: dto.name
			}
		})
	}

	async remove(id: string) {
		await this.findOne(id)

		await this.prisma.$transaction([
			this.prisma.expense.deleteMany({
				where: {
					apartmentId: id
				}
			}),
			this.prisma.apartment.delete({
				where: {
					id
				}
			})
		])
	}
}
