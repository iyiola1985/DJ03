/**
 * Vercel serverless function: POST /api/book
 * Sends booking form via Gmail. Env vars: GMAIL_USER, GMAIL_APP_PASSWORD, NOTIFY_EMAIL
 */

const { sendMail, NOTIFY_EMAIL, GMAIL_USER, GMAIL_APP_PASSWORD } = require('../server/lib/email');

function validateBooking(body) {
  const { fullName, email, phone, eventType, eventDate, eventLocation, eventDetails } = body || {};
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) return { valid: false, message: 'Full name is required.' };
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return { valid: false, message: 'A valid email is required.' };
  if (!phone || typeof phone !== 'string' || phone.trim().length < 6) return { valid: false, message: 'A valid phone is required.' };
  if (!eventType || typeof eventType !== 'string' || !eventType.trim()) return { valid: false, message: 'Event type is required.' };
  if (!eventDate || typeof eventDate !== 'string' || !eventDate.trim()) return { valid: false, message: 'Event date is required.' };
  if (!eventLocation || typeof eventLocation !== 'string' || eventLocation.trim().length < 3) return { valid: false, message: 'Location is required.' };
  if (!eventDetails || typeof eventDetails !== 'string' || eventDetails.trim().length < 20) return { valid: false, message: 'Event details (min 20 chars) required.' };
  return { valid: true };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const v = validateBooking(body);
    if (!v.valid) return res.status(400).json({ success: false, message: v.message });

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return res.status(500).json({ success: false, message: 'Email not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in Vercel environment variables.' });
    }
    if (!NOTIFY_EMAIL) {
      return res.status(500).json({ success: false, message: 'Set NOTIFY_EMAIL or GMAIL_USER in Vercel environment variables.' });
    }

    const d = body;
    const text = `New DJ03 Booking\n\nName: ${d.fullName}\nEmail: ${d.email}\nPhone: ${d.phone}\nEvent: ${d.eventType}\nDate: ${d.eventDate}\nLocation: ${d.eventLocation}\nDetails: ${d.eventDetails}\nBudget: ${d.budget || 'Not specified'}`;
    const html = `<!DOCTYPE html><html><body style="font-family:Arial"><h2>New DJ03 Booking</h2><p><b>Name:</b> ${escapeHtml(d.fullName)}</p><p><b>Email:</b> ${escapeHtml(d.email)}</p><p><b>Phone:</b> ${escapeHtml(d.phone)}</p><p><b>Event:</b> ${escapeHtml(d.eventType)}</p><p><b>Date:</b> ${escapeHtml(d.eventDate)}</p><p><b>Location:</b> ${escapeHtml(d.eventLocation)}</p><p><b>Details:</b> ${escapeHtml(d.eventDetails)}</p><p><b>Budget:</b> ${escapeHtml(d.budget || 'Not specified')}</p></body></html>`;

    await sendMail({ to: NOTIFY_EMAIL, subject: `[DJ03] Booking from ${d.fullName} – ${d.eventType}`, text, html, replyTo: d.email });
    return res.status(200).json({ success: true, message: 'Your booking request has been sent.' });
  } catch (err) {
    console.error('Booking error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send. Try WhatsApp or check your Vercel env variables.' });
  }
};
