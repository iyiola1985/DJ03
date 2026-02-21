/**
 * POST /api/book
 * Validates booking data and sends email notification via the email helper.
 */

const express = require('express');
const router = express.Router();
const { sendMail, NOTIFY_EMAIL, GMAIL_USER, GMAIL_APP_PASSWORD } = require('../lib/email');

// Basic validation – prevent empty or invalid submissions
function validateBooking(body) {
  const { fullName, email, phone, eventType, eventDate, eventLocation, eventDetails } = body;
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return { valid: false, message: 'Full name is required and must be at least 2 characters.' };
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { valid: false, message: 'A valid email address is required.' };
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
    return { valid: false, message: 'A valid phone number is required.' };
  }
  if (!eventType || typeof eventType !== 'string' || !eventType.trim()) {
    return { valid: false, message: 'Event type is required.' };
  }
  if (!eventDate || typeof eventDate !== 'string' || !eventDate.trim()) {
    return { valid: false, message: 'Event date is required.' };
  }
  if (!eventLocation || typeof eventLocation !== 'string' || eventLocation.trim().length < 3) {
    return { valid: false, message: 'Event location is required.' };
  }
  if (!eventDetails || typeof eventDetails !== 'string' || eventDetails.trim().length < 20) {
    return { valid: false, message: 'Event details must be at least 20 characters.' };
  }
  return { valid: true };
}

// Format email body professionally
function formatEmailHtml(data) {
  const budget = data.budget ? data.budget : 'Not specified';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  h1 { color: #f63900; border-bottom: 2px solid #f63900; padding-bottom: 8px; }
  .field { margin-bottom: 16px; }
  .label { font-weight: bold; color: #555; }
  .value { margin-top: 4px; }
</style></head>
<body>
<div class="container">
  <h1>New DJ03 Booking Request</h1>
  <div class="field"><span class="label">Customer Name</span><div class="value">${escapeHtml(data.fullName)}</div></div>
  <div class="field"><span class="label">Email</span><div class="value">${escapeHtml(data.email)}</div></div>
  <div class="field"><span class="label">Phone</span><div class="value">${escapeHtml(data.phone)}</div></div>
  <div class="field"><span class="label">Event Type</span><div class="value">${escapeHtml(data.eventType)}</div></div>
  <div class="field"><span class="label">Event Date</span><div class="value">${escapeHtml(data.eventDate)}</div></div>
  <div class="field"><span class="label">Location</span><div class="value">${escapeHtml(data.eventLocation)}</div></div>
  <div class="field"><span class="label">Event Details</span><div class="value">${escapeHtml(data.eventDetails)}</div></div>
  <div class="field"><span class="label">Budget</span><div class="value">${escapeHtml(budget)}</div></div>
</div>
</body>
</html>
  `.trim();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

router.post('/book', async (req, res) => {
  try {
    // Validate request body
    const validation = validateBooking(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env'
      });
    }

    if (!NOTIFY_EMAIL) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please set NOTIFY_EMAIL or GMAIL_USER in .env'
      });
    }

    const data = req.body;
    const text = `New DJ03 Booking Request\n\nName: ${data.fullName}\nEmail: ${data.email}\nPhone: ${data.phone}\nEvent Type: ${data.eventType}\nEvent Date: ${data.eventDate}\nLocation: ${data.eventLocation}\nDetails: ${data.eventDetails}\nBudget: ${data.budget || 'Not specified'}`;
    const html = formatEmailHtml(data);

    await sendMail({
      to: NOTIFY_EMAIL,
      subject: `[DJ03 Booking] Form submission from ${data.fullName} – ${data.eventType} ${data.eventDate}`,
      text,
      html,
      replyTo: data.email
    });

    return res.status(200).json({ success: true, message: 'Your booking request has been sent successfully.' });
  } catch (err) {
    console.error('Booking error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message && err.message.includes('GMAIL') ? err.message : 'Failed to send your booking request. Please try again or contact us via WhatsApp.'
    });
  }
});

module.exports = router;
