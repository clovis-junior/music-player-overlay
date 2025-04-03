import { useLayoutEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Plugin from './pages/Plugin';

export default function App() {
    useLayoutEffect(function(){
        window.history.pushState({title: document.title}, '', window.location.pathname);
    });

    return (
        <HashRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
            <Routes>
                <Route index element={<Home />} />
                <Route path='/player' element={<Plugin />} />
            </Routes>
        </HashRouter>
    )
}