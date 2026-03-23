import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Customize from './pages/Customize'
import Plugin from './pages/Player'
import Platform from './pages/Platform'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/platform/:platform" element={<Platform />} />
      <Route path="/customize" element={<Customize />} />
      <Route path="/player" element={<Plugin />} />
    </Routes>
  )
}