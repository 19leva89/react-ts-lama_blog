import { db } from "../db.js";
import jwt from "jsonwebtoken";
import fs from 'fs';
import path, { dirname } from "path";
import { fileURLToPath } from 'url';

// Получаем __dirname для ES6 модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getPosts = (req, res) => {
	const q = req.query.category
		? "SELECT * FROM posts WHERE category=?"
		: "SELECT * FROM posts";

	db.query(q, [req.query.category], (err, data) => {
		if (err) return res.status(500).send(err);

		return res.status(200).json(data);
	});
};

export const getPost = (req, res) => {
	const q =
		"SELECT p.id, `username`, `title`, `description`, p.img, u.img AS userImg, `category`,`date` FROM users u JOIN posts p ON u.id = p.userId WHERE p.id = ? ";

	db.query(q, [req.params.id], (err, data) => {
		if (err) return res.status(500).json(err);

		return res.status(200).json(data[0]);
	});
};

export const addPost = (req, res) => {
	const token = req.cookies.access_token;
	if (!token) return res.status(401).json("Not authenticated!");

	const secret = process.env.JWT_SECRET;
	jwt.verify(token, secret, (err, userInfo) => {
		if (err) return res.status(403).json("Token is not valid!");

		const q =
			"INSERT INTO posts(`title`, `description`, `img`, `category`, `date`,`userId`) VALUES (?)";

		const values = [
			req.body.title,
			req.body.description,
			req.body.img,
			req.body.category,
			req.body.date,
			userInfo.id,
		];

		db.query(q, [values], (err, data) => {
			if (err) return res.status(500).json(err);
			return res.json("Post has been created.");
		});
	});
};

export const deletePost = (req, res) => {
	const token = req.cookies.access_token;
	if (!token) return res.status(401).json("Not authenticated!");

	const secret = process.env.JWT_SECRET;
	jwt.verify(token, secret, (err, userInfo) => {
		if (err) return res.status(403).json("Token is not valid!");

		const postId = req.params.id;

		// Получаем имя изображения из БД
		const getImgQuery = "SELECT img FROM posts WHERE `id` = ? AND `userId` = ?";
		db.query(getImgQuery, [postId, userInfo.id], (err, data) => {
			if (err || data.length === 0) {
				return res.status(403).json("You can delete only your post!");
			}

			const imgName = data[0].img; // Получаем имя изображения
			const imagePath = path.join(__dirname, '..', 'client', 'public', 'upload', imgName);

			// Удаляем пост из базы данных
			const deleteQuery = "DELETE FROM posts WHERE `id` = ? AND `userId` = ?";
			db.query(deleteQuery, [postId, userInfo.id], (err, data) => {
				if (err) return res.status(500).json(err);

				// Удаляем изображение из файловой системы
				fs.unlink(imagePath, (err) => {
					if (err) {
						console.error("Failed to delete image:", err);
					}
				});

				return res.status(200).json("Post has been deleted!");
			});
		});
	});
};

export const updatePost = (req, res) => {
	const token = req.cookies.access_token;
	if (!token) {
		return res.status(401).json("Not authenticated!");
	}

	const secret = process.env.JWT_SECRET;
	jwt.verify(token, secret, (err, userInfo) => {
		if (err) {
			return res.status(403).json("Token is not valid!");
		}

		const postId = req.params.id;

		// Получаем текущее изображение из БД
		const getCurrentImgQuery = "SELECT img FROM posts WHERE id = ? AND userId = ?";
		db.query(getCurrentImgQuery, [postId, userInfo.id], (err, data) => {
			if (err) {
				return res.status(500).json(err);
			}

			const currentImg = data[0]?.img;

			const q =
				"UPDATE posts SET `title`=?,`description`=?,`img`=?,`category`=? WHERE `id` = ? AND `userId` = ?";
			const values = [
				req.body.title,
				req.body.description,
				req.body.img,
				req.body.category,
			];

			db.query(q, [...values, postId, userInfo.id], (err, data) => {
				if (err) {
					return res.status(500).json(err);
				}

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

				// Отправляем ответ в любом случае
				return res.status(200).json("Post has been updated.");
			});
		});
	});
};
