import { IsPhone } from 'src/common/decorators/phone.decorator'
import { IsString } from 'class-validator'

export class SendCodeDto {
	@IsString()
	@IsPhone()
	phone!: string
}
