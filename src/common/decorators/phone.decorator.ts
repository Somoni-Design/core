import { Matches } from 'class-validator'

export function IsPhone() {
	return Matches(/^\+992\d{9}$/, {
		message: 'Phone must be in format +992XXXXXXXXX'
	})
}
