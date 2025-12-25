import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { pool } from '../utils/db'

dotenv.config()

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@hotelapp.com'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Configure transporter (Sendgrid or SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SENDGRID_API_KEY || process.env.SMTP_PASS
  }
})

async function logEmail(payload: { bookingId?: string; recipient: string; type: string; subject: string; body: string; status: 'sent'|'failed'; error?: string; idempotencyKey?: string }){
  await pool.query(
    'INSERT INTO email_logs (booking_id, recipient_email, email_type, subject, body, status, error_message, idempotency_key) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [payload.bookingId ?? null, payload.recipient, payload.type, payload.subject, payload.body, payload.status, payload.error ?? null, payload.idempotencyKey ?? null]
  )
}

export async function sendPasswordResetEmail(email: string, token: string){
  const resetUrl = `${FRONTEND_URL}/admin/reset-password?token=${token}`
  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
    `
  }
  try{
    await transporter.sendMail(mailOptions)
    await logEmail({ recipient: email, type: 'password_reset', subject: mailOptions.subject, body: mailOptions.html, status: 'sent' })
    return true
  }catch(err){
    console.error('Failed to send email:', err)
    await logEmail({ recipient: email, type: 'password_reset', subject: mailOptions.subject, body: mailOptions.html, status: 'failed', error: String(err) })
    return false
  }
}

function makeIdempotencyKey(prefix: string, bookingId: string){
  return `${prefix}:${bookingId}`
}

async function alreadySent(key: string){
  const res = await pool.query('SELECT id FROM email_logs WHERE idempotency_key = $1 LIMIT 1', [key])
  return (res.rowCount || 0) > 0
}

async function sendWithRetry(options: any, maxRetries = 3){
  let lastErr: any
  for (let i=0;i<maxRetries;i++){
    try{ await transporter.sendMail(options); return }
    catch(err){ lastErr = err; await new Promise(r=>setTimeout(r, (i+1)*250)) }
  }
  throw lastErr
}

export async function sendBookingConfirmation(email: string, booking: any){
  const detailsUrl = `${FRONTEND_URL}/dashboard`
  const subject = `Booking Confirmed - ${booking.confirmation_id ?? booking.id}`
  const html = `
    <h2>Your booking is confirmed</h2>
    <p>Thank you for choosing Scottish Inn & Suites.</p>
    <p><strong>Confirmation:</strong> ${booking.confirmation_id ?? booking.id}</p>
    <p><strong>Room:</strong> ${booking.room_id}</p>
    <p><strong>Dates:</strong> ${booking.check_in_date} to ${booking.check_out_date}</p>
    <p><strong>Guests:</strong> ${booking.guest_count}</p>
    <p><strong>Total:</strong> $${Number(booking.total_price ?? booking.subtotal).toFixed(2)}</p>
    <p>View your reservation: <a href="${detailsUrl}">${detailsUrl}</a></p>
  `
  const key = makeIdempotencyKey('confirm', booking.id)
  try{
    if (await alreadySent(key)) return true
    await sendWithRetry({ from: FROM_EMAIL, to: email, subject, html })
    await logEmail({ bookingId: booking.id, recipient: email, type: 'booking_confirmation', subject, body: html, status: 'sent', idempotencyKey: key })
    return true
  }catch(err){
    console.error('Failed to send booking confirmation:', err)
    await logEmail({ bookingId: booking.id, recipient: email, type: 'booking_confirmation', subject, body: html, status: 'failed', error: String(err), idempotencyKey: key })
    return false
  }
}

export async function sendBookingCancellation(email: string, booking: any){
  const subject = `Booking Cancelled - ${booking.confirmation_id ?? booking.id}`
  const html = `
    <h2>Your booking was cancelled</h2>
    <p>Confirmation: ${booking.confirmation_id ?? booking.id}</p>
    ${booking.cancellation_reason ? `<p><strong>Reason:</strong> ${booking.cancellation_reason}</p>` : ''}
    <p>If this was a mistake, please contact us to rebook.</p>
  `
  const key = makeIdempotencyKey('cancel', booking.id)
  try{
    if (await alreadySent(key)) return true
    await sendWithRetry({ from: FROM_EMAIL, to: email, subject, html })
    await logEmail({ bookingId: booking.id, recipient: email, type: 'booking_cancellation', subject, body: html, status: 'sent', idempotencyKey: key })
    return true
  }catch(err){
    console.error('Failed to send booking cancellation:', err)
    await logEmail({ bookingId: booking.id, recipient: email, type: 'booking_cancellation', subject, body: html, status: 'failed', error: String(err), idempotencyKey: key })
    return false
  }
}

export async function sendLoginNotification(email: string, ip: string, userAgent: string){
  const subject = 'New login detected'
  const html = `<p>We detected a new login to your account.</p><p>IP: ${ip}</p><p>Device: ${userAgent}</p>`
  try{
    await sendWithRetry({ from: FROM_EMAIL, to: email, subject, html })
    await logEmail({ recipient: email, type: 'login_notification', subject, body: html, status: 'sent' })
  }catch(err){
    console.error('Login notification send failed:', err)
    await logEmail({ recipient: email, type: 'login_notification', subject, body: html, status: 'failed', error: String(err) })
  }
}

export async function send2FASetupEmail(email: string, appName: string = 'Hotel Management'){
  const subject = '2FA Setup Notification'
  const html = `
    <h2>Two-Factor Authentication Enabled</h2>
    <p>Two-factor authentication has been successfully enabled for your ${appName} account.</p>
    <p>Your account is now more secure. You'll need to enter a code from your authenticator app when logging in.</p>
    <p>If you didn't enable this feature, please contact support immediately.</p>
  `
  try{
    await sendWithRetry({ from: FROM_EMAIL, to: email, subject, html })
    await logEmail({ recipient: email, type: '2fa_setup', subject, body: html, status: 'sent' })
    return true
  }catch(err){
    console.error('2FA setup notification send failed:', err)
    await logEmail({ recipient: email, type: '2fa_setup', subject, body: html, status: 'failed', error: String(err) })
    return false
  }
}
