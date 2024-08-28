import { PrismaClient } from '@prisma/client'
import jwt from "jsonwebtoken";
import moment from "moment";
import fs from 'fs';
import path, { dirname } from "path";
import { fileURLToPath } from 'url';

const prisma = new PrismaClient()

// Getting __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getPosts = async (req, res) => {
	try {
		const { category } = req.query;

		// If the category is specified, filter by it, otherwise get all posts
		const posts = category
			? await prisma.posts.findMany({
				where: { category: category },
			})
			: await prisma.posts.findMany();

		// Returning posts to the client
		return res.status(200).json(posts);
	} catch (error) {
		return res.status(500).json({ error: 'Internal Server Error', details: error.message });
	}
};

export const getPost = async (req, res) => {
	try {
		const postId = parseInt(req.params.id, 10);

		// Execute a query to the database
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

		// If the post is not found, return 404
		if (!post) {
			return res.status(404).json({ error: 'Post not found' });
		}

		// Create an object with post and author data
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

		// Returning post data
		return res.status(200).json(postData);
	} catch (error) {
		return res.status(500).json({ error: 'Internal Server Error', details: error.message });
	}
};

export const addPost = async (req, res) => {
	// Getting a token from a cookie
	const token = req.cookies.access_token;
	if (!token) return res.status(401).json("Not authenticated!");

	try {
		// Check the token and extract information about the user
		const secret = process.env.JWT_SECRET;
		const userInfo = jwt.verify(token, secret);

		// Create a new post
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
	// Getting a token from a cookie
	const token = req.cookies.access_token;
	if (!token) return res.status(401).json("Not authenticated!");

	try {
		// Check the token and extract information about the user
		const secret = process.env.JWT_SECRET;
		const userInfo = jwt.verify(token, secret);

		const postId = parseInt(req.params.id, 10); // Convert id to a number

		// Checking the existence of a post and its ownership by the current user
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

		// Delete a post from the database
		await prisma.posts.delete({
			where: {
				id: postId,
			},
		});

		// Delete an image from the file system
		const imgName = post.img; // Get the image name
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
	// Getting a token from a cookie
	const token = req.cookies.access_token;
	if (!token) {
		return res.status(401).json("Not authenticated!");
	}

	try {
		// Check the token and extract information about the user
		const secret = process.env.JWT_SECRET;
		const userInfo = jwt.verify(token, secret);

		const postId = parseInt(req.params.id, 10); // Convert id to a number

		// Checking the existence of a post and its ownership by the current user
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

		const currentImg = post.img; // Get the current image

		const formattedDate = req.body.date ? new Date(req.body.date).toISOString() : undefined;

		// Updating post data
		const updatedPost = await prisma.posts.update({
			where: {
				id: postId,
			},
			data: {
				title: req.body.title,
				description: req.body.description,
				img: req.body.img,
				category: req.body.category,
				date: formattedDate,
			},
		});

		// Delete the old image if the new image is different from the current one
		if (currentImg && currentImg !== req.body.img) {
			const imagePath = path.join(__dirname, '..', 'client', 'public', 'upload', currentImg);

			// Delete an image from the file system
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
