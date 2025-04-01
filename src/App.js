import { HashRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Plugin from './pages/Plugin';

export default function App() {
    return (
        <HashRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/player' element={<Plugin />} />
            </Routes>
        </HashRouter>
    )
}