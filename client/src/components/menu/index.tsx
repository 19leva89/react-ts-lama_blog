import { FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import axios from 'axios'
import { UserPost } from '../../types'
import { BASE_URL } from '../../axios'

type Props = {
	category: string
	currentPostId: number
}

const Menu: FC<Props> = ({ category, currentPostId }) => {
	const [posts, setPosts] = useState<UserPost[]>([])

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`${BASE_URL}/posts/?category=${category}`)

				setPosts(res.data)
			} catch (err) {
				console.log(err)
			}
		}

		fetchData()
	}, [category])

	return (
		<div className="menu">
			<h1>Other posts you may like</h1>

			{posts
				.filter((post) => post.id !== currentPostId)
				.map((post) => (
					<div className="post" key={post.id}>
						<img src={`../upload/${post?.img}`} alt="" />

						<Link className="link" to={`/post/${post.id}`}>
							<h2>{post.title}</h2>
						</Link>

						<Link className="link" to={`/post/${post.id}`}>
							<button>Read More</button>
						</Link>
					</div>
				))}
		</div>
	)
}

export default Menu
