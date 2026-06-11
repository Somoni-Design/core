import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { RequestWithUser } from 'src/common/types/request-with-user.type'
import { ApproveUserDto } from './dto/approve-user.dto'
import { UpdateMeDto } from './dto/update-me.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'

@Auth()
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('me')
	@HttpCode(HttpStatus.OK)
	findMe(@CurrentUser() user: RequestWithUser['user']) {
		return this.usersService.findMe(user.id)
	}

	@Get('pending')
	@HttpCode(HttpStatus.OK)
	findPending(@CurrentUser() user: RequestWithUser['user']) {
		return this.usersService.findPending(user.role)
	}

	@Get('employees')
	@HttpCode(HttpStatus.OK)
	findEmployees(@CurrentUser() user: RequestWithUser['user']) {
		return this.usersService.findEmployees(user.id, user.role)
	}

	@Patch('me')
	@HttpCode(HttpStatus.OK)
	updateMe(
		@CurrentUser() user: RequestWithUser['user'],
		@Body() dto: UpdateMeDto
	) {
		return this.usersService.updateMe(user.id, dto)
	}

	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	updateByAdmin(
		@CurrentUser() user: RequestWithUser['user'],
		@Param('id') id: string,
		@Body() dto: UpdateUserDto
	) {
		return this.usersService.updateByAdmin(user.id, user.role, id, dto)
	}

	@Patch(':id/approve')
	@HttpCode(HttpStatus.OK)
	approve(
		@CurrentUser() user: RequestWithUser['user'],
		@Param('id') id: string,
		@Body() dto: ApproveUserDto
	) {
		return this.usersService.approve(user.role, id, dto.role)
	}
}
