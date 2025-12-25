import React from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'

const AboutPage: React.FC = () => {
    const amenities = [
        { icon: '📶', title: 'Free High-Speed Wi-Fi', desc: 'Stay connected throughout your visit' },
        { icon: '📺', title: 'Fire TV Entertainment', desc: 'Stream your favorite shows and movies' },
        { icon: '🚗', title: 'Free Parking', desc: 'Complimentary on-site parking for all guests' },
        { icon: '🏢', title: '24/7 Front Desk', desc: 'Round-the-clock assistance when you need it' },
        { icon: '🧊', title: 'Ice & Vending', desc: 'Convenient ice and snack machines on every floor' },
        { icon: '🛡️', title: 'Security', desc: 'Secure keycard access and surveillance system' }
    ]

    const policies = [
        { title: 'Check-in', detail: '3:00 PM - 11:00 PM' },
        { title: 'Check-out', detail: '11:00 AM' },
        { title: 'Cancellation', detail: 'Free cancellation 24 hours before arrival' },
        { title: 'Pets', detail: 'Pet-friendly rooms available (additional fee applies)' },
        { title: 'Smoking', detail: 'Non-smoking property' },
        { title: 'Payment', detail: 'Major credit cards accepted' }
    ]

    return (
        <Layout>
            <div className="bg-gradient-to-br from-babyblue-50 via-white to-gold-100">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-gold-800 to-babyblue-700 text-white py-16">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold mb-4"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            About Scottish Inn & Suites
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gold-100 max-w-3xl mx-auto"
                        >
                            Your comfortable, budget-friendly home away from home in Houston
                        </motion.p>
                    </div>
                </div>

                {/* Our Story Section */}
                <div className="max-w-6xl mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-gold-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Welcome to Our Family
                            </h2>
                            <div className="space-y-4 text-gray-700">
                                <p>
                                    Since our founding, Scottish Inn & Suites has been committed to providing
                                    clean, comfortable accommodations at prices that won't break the bank.
                                    Located conveniently on FM 1960 in Houston, we're perfectly positioned
                                    for both business and leisure travelers.
                                </p>
                                <p>
                                    We believe that quality hospitality doesn't have to come with a luxury price tag.
                                    Our family-owned property focuses on the essentials: spotless rooms, friendly service,
                                    and modern amenities like Fire TV entertainment systems in every room.
                                </p>
                                <p>
                                    Whether you're visiting Houston for business, exploring the city's attractions,
                                    or simply passing through, we're here to make your stay comfortable and affordable.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="h-80 bg-gradient-to-br from-gold-100 to-babyblue-200 rounded-2xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🏨</div>
                                    <div className="text-xl font-semibold text-gold-800">
                                        Family-Owned Since Day One
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Amenities Section */}
                <div className="bg-white/50 py-16">
                    <div className="max-w-6xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl font-bold text-gold-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Amenities & Services
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Everything you need for a comfortable stay, without the unnecessary frills
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                        >
                            {amenities.map((amenity, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-babyblue-200 text-center hover:shadow-lg transition-shadow"
                                >
                                    <div className="text-4xl mb-4">{amenity.icon}</div>
                                    <h3 className="text-lg font-semibold text-gold-800 mb-2">{amenity.title}</h3>
                                    <p className="text-gray-600 text-sm">{amenity.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Location Section */}
                <div className="max-w-6xl mx-auto px-4 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gold-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Perfect Location
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Strategically located on FM 1960, we offer easy access to Houston's major attractions and business districts
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-babyblue-200">
                                <h3 className="text-lg font-semibold text-gold-800 mb-4">Nearby Attractions</h3>
                                <div className="space-y-2 text-gray-700">
                                    <div className="flex justify-between">
                                        <span>IAH Airport</span>
                                        <span className="text-babyblue-600">15 minutes</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Downtown Houston</span>
                                        <span className="text-babyblue-600">25 minutes</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>The Woodlands</span>
                                        <span className="text-babyblue-600">20 minutes</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Greenspoint Mall</span>
                                        <span className="text-babyblue-600">5 minutes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-babyblue-200">
                                <h3 className="text-lg font-semibold text-gold-800 mb-4">Transportation</h3>
                                <div className="space-y-2 text-gray-700 text-sm">
                                    <p>• Direct access to major highways (I-45, Beltway 8)</p>
                                    <p>• Public transportation nearby</p>
                                    <p>• Free parking for all guests</p>
                                    <p>• Rideshare pickup/dropoff area</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="h-80 bg-gradient-to-br from-gold-100 to-babyblue-200 rounded-2xl flex items-center justify-center"
                        >
                            <div className="text-center">
                                <div className="text-6xl mb-4">📍</div>
                                <div className="text-lg font-semibold text-gold-800 mb-2">
                                    2531 FM 1960 Rd
                                </div>
                                <div className="text-babyblue-700">
                                    Houston, TX 77073
                                </div>
                                <button
                                    onClick={() => window.open('https://maps.google.com/?q=2531+FM+1960+Rd+Houston+TX+77073', '_blank')}
                                    className="mt-4 bg-babyblue-600 hover:bg-babyblue-700 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Get Directions
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Policies Section */}
                <div className="bg-white/50 py-16">
                    <div className="max-w-4xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl font-bold text-gold-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Hotel Policies
                            </h2>
                            <p className="text-gray-600">
                                Important information for your stay
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                        >
                            {policies.map((policy, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-babyblue-200"
                                >
                                    <h3 className="text-lg font-semibold text-gold-800 mb-2">{policy.title}</h3>
                                    <p className="text-gray-600">{policy.detail}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AboutPage