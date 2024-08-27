import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import axios from "axios";
import moment from "moment";

import TinyMCEEditor from "../../components/tinymce-editor";

const Write = () => {
	const state = useLocation().state;
	const [title, setTitle] = useState(state?.title || "");
	const [description, setDescription] = useState(state?.description || "");
	const [file, setFile] = useState(state?.file || "");
	const [category, setCategory] = useState(state?.category || "");
	const [previewImage, setPreviewImage] = useState(state?.img || "");

	const navigate = useNavigate()

	useEffect(() => {
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImage(reader.result);
			};
			reader.readAsDataURL(file);
		} else {
			setPreviewImage(state?.img || "");
		}
	}, [file, state?.img]);

	const upload = async () => {
		try {
			const formData = new FormData();
			formData.append("file", file);

			const res = await axios.post("/upload", formData);
			return res.data;
		} catch (err) {
			console.log(err);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		let imgUrl = previewImage;

		if (file) {
			imgUrl = await upload();
			if (!imgUrl) {
				console.error("Image upload failed");
				return;
			}
		}

		try {
			const postData = {
				title,
				description,
				category,
				img: imgUrl || state?.img || null,
			};

			if (state) {
				await axios.put(`/posts/${state.id}`, postData);
				// console.log("Post updated successfully, ID:", state.id);

				navigate(`/post/${state.id}`);  // Ensure this ID is defined
			} else {
				const response = await axios.post(`/posts/`, {
					...postData,
					date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
				});
				// console.log("New post created, ID:", response.data.id);

				navigate(`/post/${response.data.id}`); // Use the newly created post ID
			}
		} catch (err) {
			console.error("Failed to save post:", err);
		}
	};


	return (
		<div className="add">
			<div className="content">
				<input
					type="text"
					placeholder="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>

				<div className="editorContainer">
					<TinyMCEEditor
						value={description}
						onChange={setDescription}
						initOptions={{
							height: 395,
							menubar: false,
						}}
					/>
				</div>
			</div>

			<div className="menu">
				<div className="item">
					<h1>{state ? "Update" : "Publish"}</h1>

					<span>
						<b>Status: </b> Draft
					</span>

					<span>
						<b>Visibility: </b> Public
					</span>

					<div className="image-preview">
						<input
							style={{ display: "none" }}
							type="file"
							id="file"
							name=""
							onChange={(e) => setFile(e.target.files[0])}
						/>

						<label className="file" htmlFor="file">Upload Image</label>

						{previewImage && (
							<img
								src={file ? previewImage : `../upload/${previewImage}`}
								alt="preview"
							/>
						)}
					</div>

					<div className="buttons">
						<button>Save as a draft</button>

						<button onClick={handleSubmit}>
							{state ? "Update" : "Publish"}
						</button>
					</div>
				</div>

				<div className="item">
					<h1>Category</h1>

					{["art", "science", "technology", "cinema", "design", "food"].map((cat) => (
						<div className="category" key={cat}>
							<input
								type="radio"
								checked={category === cat}
								name="category"
								value={cat}
								id={cat}
								onChange={(e) => setCategory(e.target.value)}
							/>
							<label htmlFor={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</label>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Write;
