import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Req
} from '@nestjs/common'

import { Auth } from 'src/auth/decorators/auth.decorator'
import { RequestWithUser } from 'src/common/types/request-with-user.type'

import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { ExpensesService } from './expenses.service'

@Auth()
@Controller('expenses')
export class ExpensesController {
	constructor(private readonly expensesService: ExpensesService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	create(@Req() req: RequestWithUser, @Body() dto: CreateExpenseDto) {
		return this.expensesService.create(req.user.id, dto)
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	findAll() {
		return this.expensesService.findAll()
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	findOne(@Param('id') id: string) {
		return this.expensesService.findOne(id)
	}

	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
		return this.expensesService.update(id, dto)
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param('id') id: string) {
		return this.expensesService.remove(id)
	}
}
