import { IsString, Matches } from 'class-validator'
import { IsPhone } from 'src/common/decorators/phone.decorator'

export class VerifyDto {
	@IsString()
	@IsPhone()
	phone!: string

	@IsString()
	@Matches(/^\d{6}$/, {
		message: 'Code must contain exactly 6 digits'
	})
	code!: string
}