export const BASE_URL =
	process.env.NODE_ENV === 'production'
		? 'https://react-ts-lama-blog.onrender.com/api'
		: 'http://localhost:4000/api'
