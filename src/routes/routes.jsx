import { Route, Routes } from 'react-router-dom'

import Home from '../pages/Home'

function Router() {
	return (
		<Routes>
			{/* Rota Homepage */}
			<Route path='/' element={<Home />} />
		</Routes>
	)
}

export default Router
