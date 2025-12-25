import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HotelLanding from './components/hotelLanding'
import RoomsPage from './pages/RoomsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import Signup from './pages/Signup'

function App() {
    return (
        <Routes>
            <Route path="/" element={<HotelLanding />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/signup" element={<Signup />} />
        </Routes>
    )
}

export default App