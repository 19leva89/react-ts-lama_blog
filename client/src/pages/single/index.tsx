import { useEffect, useState, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import axios from 'axios'
import moment from 'moment'
import DOMPurify from 'dompurify'
import { AuthContext, AuthContextType } from '../../context/authContext'
import { UserPost } from '../../types'

import Menu from '../../components/menu'

import Edit from '../../img/edit.svg'
import Delete from '../../img/delete.svg'
import { BASE_URL } from '../../axios'

const Single = () => {
	const [post, setPost] = useState<Partial<UserPost> | null>(null)

	const location = useLocation()
	const navigate = useNavigate()

	const postId = location.pathname.split('/')[2]

	const { currentUser } = useContext(AuthContext) as AuthContextType

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`${BASE_URL}/posts/${postId}`)

				setPost(res.data)
			} catch (err) {
				console.log(err)
			}
		}

		fetchData()
	}, [postId])

	const handleDelete = async () => {
		try {
			await axios.delete(`${BASE_URL}/posts/${postId}`)

			navigate('/')
		} catch (err) {
			console.log(err)
		}
	}

	const getText = (html: string): string => {
		const cleanHtml = DOMPurify.sanitize(html)

		const doc = new DOMParser().parseFromString(cleanHtml, 'text/html')
		return doc.body.textContent || ''
	}

	if (!post) {
		return <div>Loading...</div>
	}

	return (
		<div className="single">
			<div className="content">
				{post.img && <img src={`../upload/${post.img}`} alt={post.title || 'Post Image'} />}

				<div className="user">
					{post.id && <img src={`../upload/${post.userImg}`} alt={post.username} />}

					<div className="info">
						<span>{post.username}</span>

						<p>Posted {moment(post.date).fromNow()}</p>
					</div>

					{currentUser?.username === post.username && (
						<div className="edit">
							<Link to={`/write?edit=2`} state={post}>
								<img src={Edit} alt="edit" />
							</Link>

							<img onClick={handleDelete} src={Delete} alt="delete" />
						</div>
					)}
				</div>

				<h1>{post.title}</h1>

				<p>{getText(post.description || '')}</p>
			</div>
			<Menu category={post.category || ''} currentPostId={post.id || 0} />
		</div>
	)
}

export default Single
