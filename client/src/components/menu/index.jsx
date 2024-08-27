import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axios from "axios";

const Menu = ({ category, currentPostId }) => {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`/posts/?category=${category}`);

				setPosts(res.data);
			} catch (err) {
				console.log(err);
			}
		};

		fetchData();
	}, [category]);

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
	);
};

export default Menu;
