// import axios from "axios";

export const BASE_URL =
	process.env.NODE_ENV === 'production'
		? 'https://react-ts-lama-blog-server.onrender.com/api'
		: 'http://localhost:4000/api'

// export const makeRequest = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// });
