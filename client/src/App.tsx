import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Write from "./pages/write";
import Single from "./pages/single";

import Navbar from "./components/navbar";
import Footer from "./components/footer";
import "./styles/main.scss"

const Layout = () => {
	return (
		<>
			<Navbar />
			<Outlet />
			<Footer />
		</>
	);
};

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/post/:id",
				element: <Single />,
			},
			{
				path: "/write",
				element: <Write />,
			},
		],
	},
	{
		path: "/register",
		element: <Register />,
	},
	{
		path: "/login",
		element: <Login />,
	},
]);

function App() {
	return (
		<div className="app">
			<div className="container">
				<RouterProvider router={router} />
			</div>
		</div>
	);
}

export default App;
