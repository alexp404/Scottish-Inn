import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import ImageSlideshow from './imageSlideshow'
import { fetchAvailability, createBooking } from '../services/api'
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

interface BookingPayload {
    room_id: string
    first_name: string
    last_name: string
    email: string
    check_in_date: string
    check_out_date: string
    guest_count: number
    subtotal: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const formatDate = (d: Date) => d.toISOString().split('T')[0]

const HotelLanding: React.FC = () => {
    const [availableRooms, setAvailableRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [guests, setGuests] = useState(2)
    const [roomType, setRoomType] = useState('')

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [showBookingModal, setShowBookingModal] = useState(false)

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [bookingLoading, setBookingLoading] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)

    // Navigation state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    // Use the existing useRooms hook for fallback data
    const { rooms: allRooms, loading: roomsLoading, error: roomsError } = useRooms()

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Rooms', href: '/rooms' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ]

    const isActive = (href: string) => location.pathname === href

    const todayStr = formatDate(new Date())
    const minCheckoutStr = checkIn
        ? formatDate(new Date(new Date(checkIn).getTime() + DAY_MS))
        : formatDate(new Date(Date.now() + DAY_MS))

    async function searchRooms() {
        if (!checkIn || !checkOut) return
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({
                checkIn,
                checkOut,
                guests: String(guests),
                ...(roomType && { roomType })
            })
            
            const data = await fetchAvailability(params)
            const sorted = [...data.rooms].sort((a, b) => b.basePrice - a.basePrice)
            setAvailableRooms(sorted)
        } catch (e: any) {
            console.error(e)
            setError('Unable to search rooms, showing available inventory.')
            // Fallback to all rooms if availability search fails
            setAvailableRooms(allRooms.filter(room => room.status === 'available'))
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateBooking() {
        if (!selectedRoom) return
        setBookingLoading(true)
        setError(null)
        try {
            const nights = Math.max(
                1,
                Math.ceil(
                    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / DAY_MS
                )
            )
            const subtotal = nights * selectedRoom.basePrice
            const payload: BookingPayload = {
                room_id: selectedRoom.id,
                first_name: firstName,
                last_name: lastName,
                email,
                check_in_date: checkIn,
                check_out_date: checkOut,
                guest_count: guests,
                subtotal
            }
            
            await createBooking(payload)
            setBookingSuccess(true)
            setTimeout(() => {
                setBookingSuccess(false)
                setShowBookingModal(false)
                setSelectedRoom(null)
                setFirstName('')
                setLastName('')
                setEmail('')
            }, 1800)
        } catch (e: any) {
            console.error(e)
            setError(e?.message || 'Booking failed, please try again.')
        } finally {
            setBookingLoading(false)
        }
    }

    useEffect(() => {
        const today = formatDate(new Date())
        const tomorrow = formatDate(new Date(Date.now() + DAY_MS))
        setCheckIn(today)
        setCheckOut(tomorrow)
        
        // Auto-load available rooms on mount if we have room data
        if (allRooms.length > 0) {
            setAvailableRooms(allRooms.filter(room => room.status === 'available'))
        }
    }, [allRooms])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.2 }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' }
        }
    }

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.25, ease: 'easeOut' }
        }
    }

    const nights = checkIn && checkOut
        ? Math.max(
            1,
            Math.ceil(
                (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                DAY_MS
            )
        )
        : 0

    // Stock hotel images (you can replace with real images later)
    const hotelImages = [
        'https://i.postimg.cc/TKbsD99k/hotel-front.png',
        'https://i.postimg.cc/68ZPv001/extended-stay.png', // Hotel lobby
        'https://i.postimg.cc/JsXFkqqN/jacuzzi.png'
    ]

    // Show combined error state
    const displayError = error || roomsError?.message

    return (
        <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-gold-100 text-gray-900">
            {/* Navigation Header */}
            <header className="bg-white shadow-sm border-b border-babyblue-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center">
                            <div className="text-2xl font-bold text-gold-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Scottish Inn & Suites
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`px-3 py-2 text-sm font-medium transition-colors ${isActive(item.href)
                                            ? 'text-gold-800 border-b-2 border-gold-600'
                                            : 'text-gray-700 hover:text-gold-800'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop CTA */}
                        <div className="hidden md:flex items-center space-x-4">
                            <a
                                href="tel:2818219900"
                                className="text-gold-800 hover:text-gold-900 text-sm font-medium"
                            >
                                (281) 821-9900
                            </a>
                            <button className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                Book Now
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gold-800 hover:bg-gold-50"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-babyblue-200">
                            <div className="flex flex-col space-y-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`px-3 py-2 text-base font-medium transition-colors ${isActive(item.href)
                                                ? 'text-gold-800 bg-gold-50'
                                                : 'text-gray-700 hover:text-gold-800 hover:bg-gold-50'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="pt-2 border-t border-babyblue-200 mt-2">
                                    <a
                                        href="tel:2818219900"
                                        className="block px-3 py-2 text-base font-medium text-gold-800"
                                    >
                                        Call (281) 821-9900
                                    </a>
                                    <button className="block mx-3 mt-2 bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg text-center font-semibold transition-colors w-full">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Section with Image Slideshow */}
            <div className="relative">
                <ImageSlideshow images={hotelImages} priority={true} />

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-r from-gold-900/70 to-babyblue-900/50 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-4xl md:text-6xl font-bold mb-4"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Scottish Inn & Suites
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gold-100"
                        >
                            Affordable comfort in Houston. Clean rooms, friendly service, and modern amenities at unbeatable prices.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <a
                                href="tel:2818219900"
                                className="bg-babyblue-600 hover:bg-babyblue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Call (281) 821-9900
                            </a>
                            <div className="text-gold-200 text-sm">
                                <p>📍 2531 FM 1960 Rd, Houston, TX</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Contact Info Bar */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-babyblue-600 text-white py-3"
            >
                <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 mb-2 md:mb-0">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <a href="tel:2818219900" className="hover:text-babyblue-100">
                            (281) 821-9900
                          </a>
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                           <a href="https://www.google.com/maps/dir/?api=1&destination=Scottish+Inn+%26+Suites,+Houston,+TX target="_blank">
                          2531 FM 1960 Rd, Houston, TX 77073</a>
                        </span>
                    </div>
                    <button
                      onClick={() => window.open('https://maps.google.com/?q=2531+FM+1960+Rd+Houston+TX+77073', '_blank')}
                      className="bg-white text-babyblue-600 px-4 py-1 rounded-full text-xs font-semibold hover:bg-babyblue-50 transition-colors"
                    >
                      Get Directions
                    </button>
                </div>
            </motion.section>

            {/* Search Section */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="-mt-12 mx-auto max-w-4xl px-4"
            >
                <div className="rounded-2xl border border-babyblue-200/70 bg-white/80 p-5 shadow-xl backdrop-blur-md">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gold-800">
                                Check-in
                            </label>
                            <input
                                type="date"
                                value={checkIn}
                                min={todayStr}
                                onChange={(e) => setCheckIn(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-babyblue-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gold-800">
                                Check-out
                            </label>
                            <input
                                type="date"
                                value={checkOut}
                                min={minCheckoutStr}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-babyblue-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gold-800">
                                Guests
                            </label>
                            <select
                                value={guests}
                                onChange={(e) => setGuests(Number(e.target.value) || 1)}
                                className="mt-1 w-full rounded-lg border border-babyblue-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                            >
                                {[1, 2, 3, 4].map((g) => (
                                    <option key={g} value={g}>
                                        {g} guest{g > 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gold-800">
                                Room Type
                            </label>
                            <select
                                value={roomType}
                                onChange={(e) => setRoomType(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-babyblue-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                            >
                                <option value="">Any</option>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="suite">Suite</option>
                                <option value="deluxe">Deluxe</option>
                            </select>
                        </div>
                        <div className="flex items-end md:col-span-3">
                            <button
                                type="button"
                                disabled={!checkIn || !checkOut || loading}
                                onClick={searchRooms}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-gold-600 to-babyblue-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-gold-700 hover:to-babyblue-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? 'Searching…' : 'Search Available Rooms'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Error banner */}
            {displayError && (
                <div className="mx-auto mt-6 max-w-4xl px-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {displayError}
                    </div>
                </div>
            )}

            {/* Loading state */}
            {(loading || roomsLoading) && availableRooms.length === 0 && (
                <div className="mx-auto mt-10 max-w-6xl px-4 text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading available rooms...</p>
                </div>
            )}

            {/* Rooms */}
            <section className="mx-auto mt-10 max-w-6xl px-4 pb-16">
                {availableRooms.length > 0 && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {availableRooms.map((room) => (
                            <motion.article
                                key={room.id}
                                variants={cardVariants}
                                className="flex flex-col overflow-hidden rounded-2xl border border-babyblue-200/60 bg-white/80 shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-2xl"
                            >
                                <div className="flex-1 bg-gradient-to-br from-gold-50 to-babyblue-100 p-4">
                                    <div className="flex items-baseline justify-between">
                                        <h3
                                            className="text-xl font-semibold text-gold-900"
                                            style={{ fontFamily: 'Cinzel, serif' }}
                                        >
                                            Room {room.roomNumber}
                                        </h3>
                                        <span className="rounded-full bg-gold-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-100">
                                            ${room.basePrice.toFixed(0)} / night
                                        </span>
                                    </div>
                                    <p
                                        className="mt-2 text-sm text-gray-700"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {room.roomType === 'suite'
                                            ? 'Panoramic views, Fire TV included, perfect for extended stays.'
                                            : room.roomType === 'deluxe'
                                                ? 'Premium linens, Fire TV, and curated minibar for business & leisure.'
                                                : 'Thoughtfully appointed room with high-speed Wi‑Fi and Fire TV.'}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                                        <span>Sleeps up to {room.capacity}</span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 ${room.status === 'available'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {room.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-babyblue-100 bg-white/90 p-4">
                                    <button
                                        type="button"
                                        disabled={room.status !== 'available'}
                                        onClick={() => {
                                            setSelectedRoom(room)
                                            setShowBookingModal(true)
                                        }}
                                        className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-gold-600 to-babyblue-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-gold-700 hover:to-babyblue-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {room.status === 'available'
                                            ? 'Book this room'
                                            : 'Not available'}
                                    </button>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                )}

                {!loading && !roomsLoading && availableRooms.length === 0 && checkIn && checkOut && (
                    <p className="mt-10 text-center text-sm text-gray-600">
                        No rooms available for your selected dates. Try adjusting your stay or guest count.
                    </p>
                )}
            </section>

            {/* Glassmorphism Booking Modal */}
            <AnimatePresence>
                {showBookingModal && selectedRoom && (
                    <motion.div
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowBookingModal(false)
                                setSelectedRoom(null)
                                setBookingSuccess(false)
                            }
                        }}
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="mx-4 w-full max-w-md rounded-3xl border border-babyblue-200/70 bg-white/85 p-6 shadow-2xl backdrop-blur-2xl"
                        >
                            {bookingSuccess ? (
                                <div className="py-10 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                        <span className="text-3xl text-emerald-600">✓</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-emerald-700">
                                        Booking Confirmed
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        A confirmation email will arrive shortly.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <h2
                                                className="text-xl font-semibold text-gold-900"
                                                style={{ fontFamily: 'Cinzel, serif' }}
                                            >
                                                Room {selectedRoom.roomNumber}
                                            </h2>
                                            <p className="text-xs text-gray-500">
                                                {checkIn} &mdash; {checkOut} · {guests} guest
                                                {guests > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowBookingModal(false)
                                                setSelectedRoom(null)
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="mb-4 rounded-2xl bg-gold-50/80 p-3 text-xs text-gray-700">
                                        <div className="flex justify-between">
                                            <span>Nights</span>
                                            <span>{nights || 1}</span>
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <span>Rate / night</span>
                                            <span>${selectedRoom.basePrice.toFixed(0)}</span>
                                        </div>
                                        <div className="mt-2 border-t border-gold-200 pt-2 flex justify-between font-semibold text-gold-900">
                                            <span>Estimated total</span>
                                            <span>
                                                $
                                                {(
                                                    (nights || 1) * selectedRoom.basePrice
                                                ).toFixed(0)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                First name
                                            </label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="mt-1 w-full rounded-lg border border-babyblue-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Last name
                                            </label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="mt-1 w-full rounded-lg border border-babyblue-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="mt-1 w-full rounded-lg border border-babyblue-200 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                            />
                                        </div>
                                        {error && (
                                            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                                                {error}
                                            </p>
                                        )}
                                        <div className="mt-4 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowBookingModal(false)
                                                    setSelectedRoom(null)
                                                }}
                                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                disabled={
                                                    bookingLoading ||
                                                    !firstName.trim() ||
                                                    !lastName.trim() ||
                                                    !email.trim()
                                                }
                                                onClick={handleCreateBooking}
                                                className="flex-1 rounded-lg bg-gradient-to-r from-gold-600 to-babyblue-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:from-gold-700 hover:to-babyblue-600 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {bookingLoading ? 'Booking…' : 'Confirm Booking'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Amenities Strip - New Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mx-auto max-w-6xl px-4 mt-12"
            >
                <h2 className="text-center text-2xl font-semibold text-gold-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Why Choose Scottish Inn & Suites?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: '📶', title: 'Free Wi-Fi', desc: 'High-speed internet' },
                        { icon: '📺', title: 'Fire TV', desc: 'In-room entertainment' },
                        { icon: '🚗', title: 'Free Parking', desc: 'On-site parking' },
                        { icon: '🏷️', title: 'Best Rates', desc: 'Budget-friendly prices' }
                    ].map((amenity, index) => (
                        <div key={index} className="text-center p-4 bg-white/60 rounded-lg">
                            <div className="text-3xl mb-2">{amenity.icon}</div>
                            <div className="font-semibold text-gold-800 text-sm">{amenity.title}</div>
                            <div className="text-xs text-gray-600">{amenity.desc}</div>
                        </div>
                    ))}
                </div>
            </motion.section>
        </div>
    )
}

export default HotelLanding
