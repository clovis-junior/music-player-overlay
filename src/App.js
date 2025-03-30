import { Route, Routes } from 'react-router-dom';
import PlayerPage from './pages/player';

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<PlayerPage />} />
        </Routes>
    )
}