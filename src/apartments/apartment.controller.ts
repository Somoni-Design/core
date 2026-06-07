import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Req
} from '@nestjs/common'

import { Auth } from 'src/auth/decorators/auth.decorator'
import {
	ERROR_CODES,
	errorResponse
} from 'src/common/constants/errors.constant'
import { RequestWithUser } from 'src/common/types/request-with-user.type'

import { ApartmentService } from './apartment.service'
import { CreateApartmentDto } from './dto/create-apartment.dto'
import { UpdateApartmentDto } from './dto/update-apartment.dto'

@Controller('apartments')
export class ApartmentController {
	constructor(private readonly apartmentsService: ApartmentService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	create(@Body() dto: CreateApartmentDto) {
		return this.apartmentsService.create(dto)
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	findAll() {
		return this.apartmentsService.findAll()
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	findOne(@Param('id') id: string) {
		return this.apartmentsService.findOne(id)
	}

	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	update(@Param('id') id: string, @Body() dto: UpdateApartmentDto) {
		return this.apartmentsService.update(id, dto)
	}

	@Auth()
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param('id') id: string, @Req() req: RequestWithUser) {
		if (req.user.role !== 'ADMIN') {
			throw new ForbiddenException(
				errorResponse(ERROR_CODES.APARTMENT_DELETE_DENIED)
			)
		}

		return this.apartmentsService.remove(id)
	}
}
