import { Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import PlayerPage from './Pages/PlayerPage';

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/player' element={<PlayerPage />} />
        </Routes>
    )
}