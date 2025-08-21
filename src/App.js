import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.js';
import CustomURL from './pages/CustomURL.js';
import Plugin from './pages/Plugin.js';

export const inDevelopment = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export default function App() {
    // if (inDevelopment)
    //     console.warn('Application in development mode.');

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path='/' >
                    <Route index element={<Dashboard />} />
                    <Route path='/customize-url-player' element={<CustomURL />} />
                </Route>
                <Route path='/player' element={<Plugin />} />
            </Routes>
        </BrowserRouter>
    )
}