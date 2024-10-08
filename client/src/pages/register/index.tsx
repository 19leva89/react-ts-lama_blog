import { ChangeEvent, FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import axios from 'axios'
import { BASE_URL } from '../../axios'

const Register = () => {
	const [inputs, setInputs] = useState({
		username: '',
		email: '',
		password: '',
	})
	const [err, setError] = useState<string | null>(null)

	const navigate = useNavigate()

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }))
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()

		try {
			await axios.post(`${BASE_URL}/auth/register`, inputs)

			navigate('/login')
		} catch (err: any) {
			setError(err.response.data)
		}
	}

	return (
		<div className="auth">
			<h1>Register</h1>

			<form onSubmit={handleSubmit}>
				<input required type="text" placeholder="username" name="username" onChange={handleChange} />

				<input required type="email" placeholder="email" name="email" onChange={handleChange} />

				<input required type="password" placeholder="password" name="password" onChange={handleChange} />

				<button type="submit">Register</button>

				{err && <p>{err}</p>}

				<span>
					Do you have an account? <Link to="/login">Login</Link>
				</span>
			</form>
		</div>
	)
}

export default Register
