import { FC } from 'react'

import Logo from '../../img/logo.svg'

const Footer: FC = () => {
	return (
		<footer>
			<img src={Logo} alt="logo" />

			<span>
				Made with ♥️ and <b>React.ts</b>.
			</span>
		</footer>
	)
}

export default Footer
