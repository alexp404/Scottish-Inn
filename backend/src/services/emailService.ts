// Email service disabled (stub implementation)
export async function sendPasswordResetEmail(email: string, token: string) { return true }
export async function sendBookingConfirmation(email: string, booking: any) { return true }
export async function sendBookingCancellation(email: string, booking: any) { return true }
export async function sendLoginNotification(email: string, ip: string, userAgent: string) { return true }
export async function send2FASetupEmail(email: string, appName: string = 'Hotel Management') { return true }
