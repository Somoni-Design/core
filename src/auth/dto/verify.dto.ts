import { IsEmail, IsString, Matches } from 'class-validator'

export class VerifyDto {
	@IsEmail()
	email!: string

	@IsString()
	@Matches(/^\d{6}$/, {
		message: 'Code must contain exactly 6 digits'
	})
	code!: string
}
