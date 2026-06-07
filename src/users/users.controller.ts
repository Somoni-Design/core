import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	Patch
} from '@nestjs/common'

import { ApproveUserDto } from './dto/approve-user.dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Patch(':id/approve')
	@HttpCode(HttpStatus.OK)
	approve(@Param('id') id: string, @Body() dto: ApproveUserDto) {
		return this.usersService.approve(id, dto.role)
	}
}
