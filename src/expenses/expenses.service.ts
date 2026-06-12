import { BadRequestException, Injectable } from '@nestjs/common'
import {
	ERROR_CODES,
	errorResponse
} from 'src/common/constants/errors.constant'
import { formatDate } from 'src/common/helpers/date.helper'
import { listResponse } from 'src/common/helpers/list-response.helper'
import { PrismaService } from 'src/prisma.service'
import { returnUserObject } from 'src/users/objects/return-user.object'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'

@Injectable()
export class ExpensesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(supplierId: string, dto: CreateExpenseDto) {
		const expense = await this.prisma.expense.create({
			data: {
				title: dto.title,
				amount: dto.amount,
				spentAt: new Date(dto.spentAt),
				apartmentId: dto.apartmentId,
				type: dto.type,
				supplierId
			},
			include: {
				apartment: true,
				supplier: {
					select: returnUserObject
				}
			}
		})
		return {
			...expense,
			spentAt: formatDate(expense.spentAt)
		}
	}

	async findAll() {
		const [list, count] = await this.prisma.$transaction([
			this.prisma.expense.findMany({
				include: {
					apartment: true,
					supplier: {
						select: returnUserObject
					}
				},
				orderBy: {
					spentAt: 'desc'
				}
			}),
			this.prisma.expense.count()
		])
		return listResponse(list, count)
	}

	async findOne(id: string) {
		const expense = await this.prisma.expense.findUnique({
			where: { id },
			include: {
				apartment: true,
				supplier: {
					select: returnUserObject
				}
			}
		})

		if (!expense) {
			throw new BadRequestException(
				errorResponse(ERROR_CODES.EXPENSE_NOT_FOUND)
			)
		}

		return expense
	}

	async update(id: string, dto: UpdateExpenseDto) {
		await this.findOne(id)

		if (dto.apartmentId) {
			const apartment = await this.prisma.apartment.findUnique({
				where: { id: dto.apartmentId }
			})

			if (!apartment) {
				throw new BadRequestException(
					errorResponse(ERROR_CODES.APARTMENT_NOT_FOUND)
				)
			}
		}

		return this.prisma.expense.update({
			where: { id },
			data: {
				title: dto.title,
				amount: dto.amount,
				spentAt: dto.spentAt ? new Date(dto.spentAt) : undefined,
				type: dto.type,
				apartmentId: dto.apartmentId
			},
			include: {
				apartment: true,
				supplier: {
					select: returnUserObject
				}
			}
		})
	}

	async remove(id: string) {
		await this.findOne(id)

		return this.prisma.expense.delete({
			where: { id }
		})
	}
}
