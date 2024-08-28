import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient()

export const register = async (req, res) => {
	try {
		const { username, email, password } = req.body

		// Проверка существующего пользователя по email или username
		const existingUser = await prisma.users.findFirst({
			where: {
				OR: [
					{ email: email },
					{ username: username },
				],
			},
		})

		if (existingUser) {
			return res.status(409).json("User already exists!")
		}

		// Хэширование пароля
		const salt = bcrypt.genSaltSync(10)
		const hashedPassword = bcrypt.hashSync(password, salt)

		// Создание нового пользователя
		const newUser = await prisma.users.create({
			data: {
				username,
				email,
				password: hashedPassword,
			},
		})

		return res.status(200).json("User has been created.")
	} catch (error) {
		return res.status(500).json({ error: 'Internal Server Error', details: error.message })
	}
}

export const login = async (req, res) => {
	try {
		const { username, password } = req.body

		// Проверка наличия пользователя
		const user = await prisma.users.findFirst({
			where: { username: username },
		})

		if (!user) {
			return res.status(404).json("User not found!")
		}

		// Проверка правильности пароля
		const isPasswordCorrect = bcrypt.compareSync(password, user.password)

		if (!isPasswordCorrect) {
			return res.status(400).json("Wrong username or password!")
		}

		// Генерация JWT токена
		const secret = process.env.JWT_SECRET
		const token = jwt.sign({ id: user.id }, secret)

		// Удаление пароля из данных перед отправкой ответа
		const { password: _, ...other } = user

		res
			.cookie("access_token", token, {
				httpOnly: true,
			})
			.status(200)
			.json(other)
	} catch (error) {
		return res.status(500).json({ error: 'Internal Server Error', details: error.message })
	}
}

export const logout = (req, res) => {
	res.clearCookie("access_token", {
		sameSite: "none",
		secure: true
	}).status(200).json("User has been logged out.")
};
