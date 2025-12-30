import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import PrefetchLink from './ui/PrefetchLink'

interface LayoutProps {
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Rooms', href: '/rooms' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ]

    const isActive = (href: string) => location.pathname === href

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-babyblue-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <PrefetchLink to="/" className="flex items-center">
                            <div className="text-2xl font-bold text-gold-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Scottish Inn & Suites
                            </div>
                        </PrefetchLink>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            {navigation.map((item) => (
                                <PrefetchLink
                                    key={item.name}
                                    to={item.href}
                                    className={`px-3 py-2 text-sm font-medium transition-colors ${isActive(item.href)
                                            ? 'text-gold-800 border-b-2 border-gold-600'
                                            : 'text-gray-700 hover:text-gold-800'
                                        }`}
                                >
                                    {item.name}
                                </PrefetchLink>
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
                            <PrefetchLink
                                to="/rooms"
                                className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Book Now
                            </PrefetchLink>
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
                                    <Link
                                        to="/rooms"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block mx-3 mt-2 bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg text-center font-semibold transition-colors"
                                    >
                                        Book Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gold-900 text-white">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Contact Us
                            </h3>
                            <div className="space-y-2 text-gold-100">
                                <p>2531 FM 1960 Rd</p>
                                <p>Houston, TX 77073</p>
                                <a href="tel:2818219900" className="block hover:text-white transition-colors">
                                    (281) 821-9900
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Quick Links
                            </h3>
                            <div className="space-y-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="block text-gold-100 hover:text-white transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Amenities
                            </h3>
                            <div className="space-y-1 text-gold-100 text-sm">
                                <p>?? Free Wi-Fi</p>
                                <p>?? Fire TV Entertainment</p>
                                <p>?? Free Parking</p>
                                <p>?? 24/7 Front Desk</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gold-800 mt-8 pt-8 text-center text-gold-200 text-sm">
                        <p>&copy; 2024 Scottish Inn & Suites. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Layout