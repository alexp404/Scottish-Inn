import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { fetchAvailability } from '../services/api'
import useRooms from '../hooks/useRooms'

interface Room {
    id: string
    roomNumber: string
    roomType: string
    capacity: number
    basePrice: number
    status: string
    images: string[]
}

const RoomsPage: React.FC = () => {
    const [availableRooms, setAvailableRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [guests, setGuests] = useState(2)
    const [roomType, setRoomType] = useState('')
    const [priceRange, setPriceRange] = useState([0, 500])

    // Use existing useRooms hook for fallback data
    const { rooms: allRooms, loading: roomsLoading, error: roomsError } = useRooms()

    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    const today = formatDate(new Date())
    const tomorrow = formatDate(new Date(Date.now() + 86400000))

    const searchRooms = async () => {
        if (!checkIn || !checkOut) {
            // Show all available rooms if no dates selected
            setAvailableRooms(allRooms.filter(room => room.status === 'available'))
            return
        }

        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({
                checkIn,
                checkOut,
                guests: guests.toString(),
                ...(roomType && { roomType })
            })

            const data = await fetchAvailability(params)
            const sorted = data.rooms.sort((a: Room, b: Room) => a.basePrice - b.basePrice)
            setAvailableRooms(sorted)
        } catch (e: any) {
            console.error(e)
            setError('Unable to search rooms. Showing available inventory.')
            // Fallback to all available rooms
            setAvailableRooms(allRooms.filter(room => room.status === 'available'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setCheckIn(today)
        setCheckOut(tomorrow)
        // Auto-load available rooms on mount
        if (allRooms.length > 0) {
            setAvailableRooms(allRooms.filter(room => room.status === 'available'))
        }
    }, [allRooms])

    const filteredRooms = availableRooms.filter(room =>
        room.basePrice >= priceRange[0] && room.basePrice <= priceRange[1]
    )

    // Show combined error state
    const displayError = error || roomsError?.message

    return (
        <Layout>
            <div className="bg-gradient-to-br from-orange-50 via-white to-amber-100 min-h-screen">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-16">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Our Rooms
                        </h1>
                        <p className="text-xl text-amber-100">
                            Comfortable accommodations at budget-friendly prices
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200 sticky top-4">
                                <h2 className="text-lg font-semibold text-amber-800 mb-4">Filter Rooms</h2>

                                {/* Date Selection */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            min={today}
                                            className="w-full p-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                                        <input
                                            type="date"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            min={checkIn || tomorrow}
                                            className="w-full p-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                                        <select
                                            value={guests}
                                            onChange={(e) => setGuests(Number(e.target.value))}
                                            className="w-full p-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        >
                                            {[1, 2, 3, 4].map(num => (
                                                <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Room Type Filter */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                                    <select
                                        value={roomType}
                                        onChange={(e) => setRoomType(e.target.value)}
                                        className="w-full p-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        <option value="">Any Type</option>
                                        <option value="single">Single</option>
                                        <option value="double">Double</option>
                                        <option value="suite">Suite</option>
                                        <option value="deluxe">Deluxe</option>
                                    </select>
                                </div>

                                {/* Price Range Filter */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                                    </label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="300"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>

                                <button
                                    onClick={searchRooms}
                                    disabled={loading}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Searching...' : 'Update Results'}
                                </button>
                            </div>
                        </div>

                        {/* Error Display */}
                        {displayError && (
                            <div className="lg:col-span-3">
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                                    {displayError}
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {(loading || roomsLoading) && availableRooms.length === 0 && (
                            <div className="lg:col-span-3">
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Searching available rooms...</p>
                                </div>
                            </div>
                        )}

                        {/* Rooms Grid */}
                        {!loading && !roomsLoading && (
                            <div className="lg:col-span-3">
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {filteredRooms.map((room, index) => (
                                        <motion.div
                                            key={room.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-amber-200 hover:shadow-xl transition-shadow"
                                        >
                                            {/* Room Image Placeholder */}
                                            <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-amber-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                        {room.roomNumber}
                                                    </div>
                                                    <div className="text-lg text-amber-600 capitalize">
                                                        {room.roomType} Room
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-800 capitalize">
                                                            {room.roomType} Room
                                                        </h3>
                                                        <p className="text-gray-600 text-sm">
                                                            Room {room.roomNumber} • Sleeps {room.capacity}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-amber-600">
                                                            ${room.basePrice}
                                                        </div>
                                                        <div className="text-sm text-gray-500">per night</div>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="flex flex-wrap gap-2 text-xs">
                                                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Free Wi-Fi</span>
                                                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Fire TV</span>
                                                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">A/C</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        room.status === 'available'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {room.status}
                                                    </span>

                                                    <button
                                                        disabled={room.status !== 'available'}
                                                        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {room.status === 'available' ? 'Book Now' : 'Unavailable'}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {filteredRooms.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-500 text-lg mb-4">No rooms match your criteria</div>
                                        <p className="text-gray-400 mb-4">Try adjusting your filters or dates</p>
                                        <button
                                            onClick={() => {
                                                setPriceRange([0, 500])
                                                setRoomType('')
                                                searchRooms()
                                            }}
                                            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default RoomsPage