import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { submitContactForm } from '../services/api'

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
    const [errorMessage, setErrorMessage] = useState('')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitStatus(null)
        setErrorMessage('')

        try {
            // Prepare the payload, excluding phone if empty
            const payload = {
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                ...(formData.phone && { phone: formData.phone })
            }

            await submitContactForm(payload)
            setSubmitStatus('success')
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            })
        } catch (e: any) {
            console.error('Contact form submission error:', e)
            setSubmitStatus('error')
            setErrorMessage(e?.message || 'Failed to send message. Please try calling us directly.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Layout>
            <div className="bg-gradient-to-br from-orange-50 via-white to-amber-100 min-h-screen">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-16">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold mb-4"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Contact Us
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-amber-100"
                        >
                            We're here to help make your stay perfect
                        </motion.p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-2xl font-bold text-amber-800 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Get In Touch
                            </h2>

                            {/* Contact Cards */}
                            <div className="space-y-6">
                                {/* Phone */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-amber-100 rounded-lg p-3">
                                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">Phone</h3>
                                            <p className="text-gray-600">Call us 24/7</p>
                                            <a
                                                href="tel:8328438323"
                                                className="text-amber-600 hover:text-amber-700 font-semibold text-lg"
                                            >
                                                (832) 843-8323
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-amber-100 rounded-lg p-3">
                                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">Address</h3>
                                            <p className="text-gray-600">Visit us at</p>
                                            <div className="text-amber-700">
                                                <p>2531 FM 1960 Rd</p>
                                                <p>Houston, TX 77073</p>
                                            </div>
                                            <button
                                                onClick={() => window.open('https://maps.google.com/?q=2531+FM+1960+Rd+Houston+TX+77073', '_blank')}
                                                className="mt-2 text-amber-600 hover:text-amber-700 font-semibold text-sm"
                                            >
                                                Get Directions →
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-amber-100 rounded-lg p-3">
                                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">Front Desk Hours</h3>
                                            <p className="text-gray-600">We're always here for you</p>
                                            <p className="text-amber-700 font-semibold">24 Hours / 7 Days a Week</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="mt-8">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
                                    <div className="h-64 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">🗺️</div>
                                            <p className="text-amber-700 font-semibold">Interactive Map</p>
                                            <button
                                                onClick={() => window.open('https://maps.google.com/?q=2531+FM+1960+Rd+Houston+TX+77073', '_blank')}
                                                className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                View on Google Maps
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-amber-200">
                                <h2 className="text-2xl font-bold text-amber-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    Send Us a Message
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                disabled={isSubmitting}
                                                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                disabled={isSubmitting}
                                                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="(123) 456-7890"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isSubmitting}
                                            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="reservation">Reservation Inquiry</option>
                                            <option value="existing">Existing Reservation</option>
                                            <option value="complaint">Complaint</option>
                                            <option value="compliment">Compliment</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            required
                                            rows={5}
                                            disabled={isSubmitting}
                                            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    {submitStatus === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg"
                                        >
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Thank you for your message! We'll get back to you within 24 hours.
                                            </div>
                                        </motion.div>
                                    )}

                                    {submitStatus === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
                                        >
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errorMessage || 'Sorry, there was an error sending your message. Please try calling us directly.'}
                                            </div>
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()}
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending...
                                            </span>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 pt-6 border-t border-amber-200">
                                    <p className="text-sm text-gray-600 text-center">
                                        For immediate assistance, please call us at{' '}
                                        <a href="tel:8328438323" className="text-amber-600 hover:text-amber-700 font-semibold">
                                            (832) 843-8323
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ContactPage