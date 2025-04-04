import { HashRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Plugin from './pages/Plugin';

export default function App() {
    return (
        <HashRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
            <Routes>
                <Route index element={<Dashboard />} />
                <Route path='/player' element={<Plugin />} />
            </Routes>
        </HashRouter>
    )
}