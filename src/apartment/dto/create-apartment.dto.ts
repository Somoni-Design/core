import { IsNotEmpty, IsString } from 'class-validator'

export class CreateApartmentDto {
	@IsString()
	@IsNotEmpty()
	name!: string
}
