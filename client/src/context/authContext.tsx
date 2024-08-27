import { createContext, ReactNode, useEffect, useState } from 'react'
import axios from 'axios'
import { User } from '../types'

interface LoginInputs {
	username: string
	password: string
}

export interface AuthContextType {
	currentUser: User | null
	login: (inputs: LoginInputs) => Promise<void>
	logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthContextProviderProps {
	children: ReactNode
}

export const AuthContexProvider = ({ children }: AuthContextProviderProps) => {
	const [currentUser, setCurrentUser] = useState<User | null>(() => {
		const storedUser = localStorage.getItem('user')
		return storedUser ? JSON.parse(storedUser) : null
	})

	const login = async (inputs: LoginInputs) => {
		const res = await axios.post('/auth/login', inputs)
		setCurrentUser(res.data)
	}

	const logout = async () => {
		await axios.post('/auth/logout')
		setCurrentUser(null)
	}

	useEffect(() => {
		if (currentUser) {
			localStorage.setItem('user', JSON.stringify(currentUser))
		} else {
			localStorage.removeItem('user')
		}
	}, [currentUser])

	return <AuthContext.Provider value={{ currentUser, login, logout }}>{children}</AuthContext.Provider>
}
