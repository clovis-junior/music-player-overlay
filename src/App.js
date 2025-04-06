import { HashRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Plugin from './pages/Plugin';

export const inDevelopment = ((window.location.host === 'localhost' || (!process.env.REACT_APP_ENV || process.env.REACT_APP_ENV)) === 'development');

export default function App() {
    if(inDevelopment)
        console.warn('Application in development mode.');

    return (
        <HashRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
            <Routes>
                <Route index element={<Dashboard />} />
                <Route path='/player' element={<Plugin />} />
            </Routes>
        </HashRouter>
    )
}