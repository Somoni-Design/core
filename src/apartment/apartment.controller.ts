import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post
} from '@nestjs/common'

import { ApartmentService } from './apartment.service'
import { CreateApartmentDto } from './dto/create-apartment.dto'
import { UpdateApartmentDto } from './dto/update-apartment.dto'

@Controller('apartment')
export class ApartmentController {
	constructor(private readonly apartmentsService: ApartmentService) {}

	@Post()
	create(@Body() dto: CreateApartmentDto) {
		return this.apartmentsService.create(dto)
	}

	@Get()
	findAll() {
		return this.apartmentsService.findAll()
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.apartmentsService.findOne(id)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateApartmentDto) {
		return this.apartmentsService.update(id, dto)
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param('id') id: string) {
		return this.apartmentsService.remove(id)
	}
}
