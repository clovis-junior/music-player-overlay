import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Plugin from './pages/Plugin';

export default function App() {
    return (
        <>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/player' element={<Plugin />} />
            </Routes>
        </>
    )
}