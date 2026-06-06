import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsString,
	IsUUID,
	Min
} from 'class-validator'

export class CreateExpenseDto {
	@IsUUID()
	apartmentId!: string

	@IsString()
	@IsNotEmpty()
	title!: string

	@IsNumber()
	@Min(0)
	amount!: number

	@IsDateString()
	spentAt!: string
}
