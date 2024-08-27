import { useState, useContext, ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthContext, AuthContextType } from '../../context/authContext'

const Login = () => {
	const [inputs, setInputs] = useState({
		username: '',
		password: '',
	})
	const [err, setError] = useState<string | null>(null)

	const navigate = useNavigate()

	const { login } = useContext(AuthContext) as AuthContextType

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }))
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()

		try {
			await login(inputs)

			navigate('/')
		} catch (err: any) {
			setError(err.response.data)
		}
	}

	return (
		<div className="auth">
			<h1>Login</h1>

			<form onSubmit={handleSubmit}>
				<input required type="text" placeholder="username" name="username" onChange={handleChange} />

				<input required type="password" placeholder="password" name="password" onChange={handleChange} />

				<button type="submit">Login</button>

				{err && <p>{err}</p>}

				<span>
					Don't you have an account? <Link to="/register">Register</Link>
				</span>
			</form>
		</div>
	)
}

export default Login
