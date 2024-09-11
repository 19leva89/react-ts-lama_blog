import { useState, useEffect, FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import axios from 'axios'
import moment from 'moment'

import TinyMCEEditor from '../../components/tinymce-editor'
import { BASE_URL } from '../../axios'

const Write = () => {
	const { state } = useLocation()
	const [title, setTitle] = useState(state?.title || '')
	const [description, setDescription] = useState(state?.description || '')
	const [file, setFile] = useState<File | null>(null)
	const [category, setCategory] = useState(state?.category || '')
	const [previewImage, setPreviewImage] = useState(state?.img || '')

	const navigate = useNavigate()

	useEffect(() => {
		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => setPreviewImage(reader.result as string)

			reader.readAsDataURL(file)
		} else {
			setPreviewImage(state?.img || '')
		}
	}, [file, state?.img])

	const uploadImage = async () => {
		if (!file) {
			console.error('No file selected for upload.')
			alert('Please select a file to upload.')
			return null
		}

		try {
			const formData = new FormData()
			formData.append('file', file)

			const res = await axios.post(`${BASE_URL}/upload`, formData)
			return res.data
		} catch (err) {
			console.error('Image upload failed:', err)
			alert('Image upload failed. Please try again.')
			return null
		}
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()

		let imgUrl = previewImage

		if (file) {
			const uploadedImageUrl = await uploadImage()

			if (!uploadedImageUrl) {
				console.error('Image upload failed')
				return
			}
			imgUrl = uploadedImageUrl
		}

		const postData = {
			title,
			description,
			img: imgUrl || state.img || null,
			date: moment().format('YYYY-MM-DD HH:mm:ss'),
			category,
		}

		try {
			if (state) {
				await axios.put(`${BASE_URL}/posts/${state.id}`, postData)
				navigate(`/post/${state.id}`)
			} else {
				const response = await axios.post(`${BASE_URL}/posts/`, postData)
				navigate(`/post/${response.data.id}`)
			}
		} catch (error) {
			console.error('Failed to save post:', error)
			alert('Failed to save post. Please try again.')
		}
	}

	return (
		<div className="add">
			<div className="content">
				<input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

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
					<h1>{state ? 'Update' : 'Publish'}</h1>

					<span>
						<b>Status: </b> Draft
					</span>

					<span>
						<b>Visibility: </b> Public
					</span>

					<div className="image-preview">
						<input
							style={{ display: 'none' }}
							type="file"
							id="file"
							name=""
							onChange={(e) => {
								const files = e.target.files
								if (files && files.length > 0) {
									setFile(files[0])
								} else {
									setFile(null)
								}
							}}
						/>

						<label className="file" htmlFor="file">
							Upload Image
						</label>

						{previewImage && <img src={file ? previewImage : `../upload/${previewImage}`} alt="preview" />}
					</div>

					<div className="buttons">
						<button>Save as a draft</button>

						<button onClick={handleSubmit}>{state ? 'Update' : 'Publish'}</button>
					</div>
				</div>

				<div className="item">
					<h1>Category</h1>

					{['art', 'science', 'technology', 'cinema', 'design', 'food'].map((cat) => (
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
	)
}

export default Write
