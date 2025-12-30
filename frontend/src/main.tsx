import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import Toasts from './components/ui/Toast'
import ErrorBoundary from './components/app/ErrorBoundary'
import GlobalErrorCatcher from './components/app/GlobalErrorCatcher'
import LoadingSpinner from './components/ui/LoadingSpinner'
import './styles/global.css'

// Eager load: Only the landing page for instant first paint
import App from './App'

// Lazy load: All other pages with code splitting
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const BookingDetail = lazy(() => import('./pages/BookingDetail'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const TwoFactorSetup = lazy(() => import('./pages/TwoFactorSetup'))
const SessionManagement = lazy(() => import('./pages/SessionManagement'))
const Checkout = lazy(() => import('./pages/Checkout'))
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'))
const Confirmation = lazy(() => import('./pages/Confirmation'))
const Signup = lazy(() => import('./pages/Signup'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDevices = lazy(() => import('./pages/AdminDevices'))
const RoomsPage = lazy(() => import('./pages/RoomsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <GlobalErrorCatcher />
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-babyblue-50 via-white to-gold-100">
              <LoadingSpinner />
            </div>
          }>
            <Routes>
              <Route path="*" element={<App />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/devices" element={<AdminDevices />} />
              <Route path="/admin/bookings/:id" element={<BookingDetail />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin/reset-password" element={<ResetPassword />} />
              <Route path="/admin/2fa/setup2" element={<TwoFactorSetup />} />
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
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
      <Toasts />
    </ToastProvider>
  </React.StrictMode>
)
