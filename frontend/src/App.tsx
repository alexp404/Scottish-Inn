import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HotelLanding from './components/hotelLanding'
import { usePrefetchOnIdle } from './hooks/usePrefetch'

function App() {
    // Prefetch likely routes when browser is idle
    // This preloads common pages in the background
    usePrefetchOnIdle(['/rooms', '/about', '/contact', '/signup'])

    return (
        <Routes>
            <Route path="*" element={<HotelLanding />} />
        </Routes>
    )
}

export default App