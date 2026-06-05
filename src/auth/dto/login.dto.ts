import { IsString, MinLength } from 'class-validator'
import { IsPhone } from 'src/common/decorators/phone.decorator'

export class LoginDto {
	@IsString()
	@IsPhone()
	phone!: string

	@IsString()
	@MinLength(8)
	password!: string
}
