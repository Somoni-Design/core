import { IsOptional, IsString, Matches, MinLength } from 'class-validator'

export class UpdateMeDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	fullName?: string

	@IsOptional()
	@IsString()
	@Matches(/^\+992\d{9}$/, {
		message: 'Телефон должен быть в формате +992900000000'
	})
	phone?: string
}
