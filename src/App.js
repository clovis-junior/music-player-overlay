import { HashRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Plugin from './pages/Plugin';

export const inDevelopment = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export default function App() {
    // if (inDevelopment)
    //     console.warn('Application in development mode.');

    return (
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route index element={<Dashboard />} />
                <Route path='/player' element={<Plugin />} />
            </Routes>
        </HashRouter>
    )
}