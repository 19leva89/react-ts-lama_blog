export type ErrorWithMessage = {
	status: number
	data: {
		msg: string
	}
}

export interface User {
	id: number
	username: string
	email: string
	password: string
	img: string
}

export interface UserPost {
	id: number
	title: string
	description: string
	img: string
	date: Date
	userId: number
	category: string
	username: string
	userImg: string
}
