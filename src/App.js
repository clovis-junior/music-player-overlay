import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import PlayerPage from './pages/PlayerPage';

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/player' element={<PlayerPage />} />
        </Routes>
    )
}