export const listResponse = <T>(
	list: T[],
	count: number,
	page?: number,
	limit?: number
) => {
	return {
		list,
		count,
		page,
		limit
	}
}
