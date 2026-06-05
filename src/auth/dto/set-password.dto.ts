import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class SetPasswordDto {
	@IsString()
	token!: string

	@IsString()
	@MinLength(8)
	@MaxLength(64)
	@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
		message:
			'Password must contain at least one uppercase letter, one lowercase letter and one digit'
	})
	password!: string
}
