import { Body, Controller, Param, Patch } from '@nestjs/common'

import { ApproveUserDto } from './dto/approve-user.dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Patch(':id/approve')
	approve(@Param('id') id: string, @Body() dto: ApproveUserDto) {
		return this.usersService.approve(id, dto.role)
	}
}
