import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import AdminDashboard from './pages/AdminDashboard'
import BookingDetail from './pages/BookingDetail'
import AdminLogin from './pages/AdminLogin'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import TwoFactorSetup from './pages/TwoFactorSetup'
import SessionManagement from './pages/SessionManagement'
import Checkout from './pages/Checkout'
import GuestDashboard from './pages/GuestDashboard'
import Confirmation from './pages/Confirmation'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import AdminDevices from './pages/AdminDevices'
import RoomsPage from './pages/RoomsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import { ToastProvider } from './context/ToastContext'
import Toasts from './components/ui/Toast'
import ErrorBoundary from './components/app/ErrorBoundary'
import GlobalErrorCatcher from './components/app/GlobalErrorCatcher'
import './styles/global.css'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <GlobalErrorCatcher />
          <Routes>
            <Route path="*" element={<App />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/devices" element={<AdminDevices />} />
            <Route path="/admin/bookings/:id" element={<BookingDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            <Route path="/admin/2fa/setup" element={<TwoFactorSetup />} />
            <Route path="/admin/sessions" element={<SessionManagement />} />

            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout/:bookingId" element={<Checkout />} />
            <Route path="/confirmation/:bookingId" element={<Confirmation />} />
            <Route path="/dashboard" element={<GuestDashboard />} />

            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      <Toasts />
    </ToastProvider>
  </React.StrictMode>
)
