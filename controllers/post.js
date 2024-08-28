import { PrismaClient } from '@prisma/client'
import jwt from "jsonwebtoken";
import moment from "moment";
import fs from 'fs';
import path, { dirname } from "path";
import { fileURLToPath } from 'url';

const prisma = new PrismaClient()

// Получаем __dirname для ES6 модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getPosts = async (req, res) => {
	try {
		const { category } = req.query;

		// Если категория указана, фильтруем по ней, иначе получаем все посты
		const posts = category
			? await prisma.posts.findMany({
				where: { category: category },
			})
			: await prisma.posts.findMany();

		// Возвращаем посты клиенту
		return res.status(200).json(posts);
	} catch (error) {
		return res.status(500).json({ error: 'Internal Server Error', details: error.message });
	}
};

export const getPost = async (req, res) => {
	try {
		const postId = parseInt(req.params.id, 10);

		// Выполняем запрос к базе данных
		const post = await prisma.posts.findUnique({
			where: { id: postId },
			include: {
				user: {
					select: {
						username: true,
						img: true,
					},
				},
			},
		});

		// Если пост не найден, возвращаем 404
		if (!post) {
			return res.status(404).json({ error: 'Post not found' });
		}

		// Формируем объект с данными поста и автора
		const postData = {
			id: post.id,
			username: post.user.username,
			title: post.title,
			description: post.description,
			img: post.img,
			userImg: post.user.img,
			category: post.category,
			date: post.date,
		};

		// Возвращаем данные поста
		return res.status(200).json(postData);
	} catch (error) {
		return res.status(500).json({ error: 'Internal Server Error', details: error.message });
	}
};

export const addPost = async (req, res) => {
	// Получаем токен из куки
	const token = req.cookies.access_token;
	if (!token) return res.status(401).json("Not authenticated!");

	try {
		// Проверяем токен и извлекаем информацию о пользователе
		const secret = process.env.JWT_SECRET;
		const userInfo = jwt.verify(token, secret);

		// Создаём новый пост
		const newPost = await prisma.posts.create({
			data: {
				title: req.body.title,
				description: req.body.description,
				img: req.body.img,
				category: req.body.category,
				date: moment(Date.now()).toDate(),
				userId: userInfo.id,
			},
		});

		return res.status(201).json("Post has been created.");
	} catch (err) {
		if (err.name === 'JsonWebTokenError') {
			return res.status(403).json("Token is not valid!");
		}
		return res.status(500).json({ error: 'Internal Server Error', details: err.message });
	}
};

export const deletePost = async (req, res) => {
	// Получаем токен из куки
	const token = req.cookies.access_token;
	if (!token) return res.status(401).json("Not authenticated!");

	try {
		// Проверяем токен и извлекаем информацию о пользователе
		const secret = process.env.JWT_SECRET;
		const userInfo = jwt.verify(token, secret);

		const postId = parseInt(req.params.id, 10); // Приводим id к числу

		// Проверяем наличие поста и его принадлежность текущему пользователю
		const post = await prisma.posts.findUnique({
			where: {
				id: postId,
				userId: userInfo.id,
			},
			select: {
				img: true,
			},
		});

		if (!post) {
			return res.status(403).json("You can delete only your post!");
		}

		// Удаляем пост из базы данных
		await prisma.posts.delete({
			where: {
				id: postId,
			},
		});

		// Удаляем изображение из файловой системы
		const imgName = post.img; // Получаем имя изображения
		const imagePath = path.join(__dirname, '..', 'client', 'public', 'upload', imgName);

		fs.unlink(imagePath, (err) => {
			if (err) {
				console.error("Failed to delete image:", err);
			}
		});

		return res.status(200).json("Post has been deleted!");
	} catch (err) {
		if (err.name === 'JsonWebTokenError') {
			return res.status(403).json("Token is not valid!");
		}
		return res.status(500).json({ error: 'Internal Server Error', details: err.message });
	}
};

export const updatePost = async (req, res) => {
	// Получаем токен из куки
	const token = req.cookies.access_token;
	if (!token) {
		return res.status(401).json("Not authenticated!");
	}

	try {
		// Проверяем токен и извлекаем информацию о пользователе
		const secret = process.env.JWT_SECRET;
		const userInfo = jwt.verify(token, secret);

		const postId = parseInt(req.params.id, 10); // Приводим id к числу

		// Проверяем наличие поста и его принадлежность текущему пользователю
		const post = await prisma.posts.findUnique({
			where: {
				id: postId,
				userId: userInfo.id,
			},
			select: {
				img: true,
			},
		});

		if (!post) {
			return res.status(403).json("You can update only your post!");
		}

		const currentImg = post.img; // Получаем текущее изображение

		// Обновляем данные поста
		const updatedPost = await prisma.posts.update({
			where: {
				id: postId,
			},
			data: {
				title: req.body.title,
				description: req.body.description,
				img: req.body.img,
				category: req.body.category,
			},
		});

		// Удаляем старое изображение, если новое изображение отличается от текущего
		if (currentImg && currentImg !== req.body.img) {
			const imagePath = path.join(__dirname, '..', 'client', 'public', 'upload', currentImg);

			// Удаляем изображение из файловой системы
			fs.unlink(imagePath, (err) => {
				if (err) {
					console.error("Failed to delete image:", err);
				}
			});
		}

		return res.status(200).json("Post has been updated.");
	} catch (err) {
		if (err.name === 'JsonWebTokenError') {
			return res.status(403).json("Token is not valid!");
		}
		return res.status(500).json({ error: 'Internal Server Error', details: err.message });
	}
};
