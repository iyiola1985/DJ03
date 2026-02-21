/**
 * Email helper for sending form submissions via Gmail.
 * Uses GMAIL_USER and GMAIL_APP_PASSWORD from process.env.
 * Falls back to EMAIL_USER and EMAIL_PASS for backward compatibility.
 */

const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER || process.env.EMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

/** Where form submissions should be sent. */
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || process.env.EMAIL_TO || GMAIL_USER;

let transporter = null;

function getTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD (or EMAIL_USER and EMAIL_PASS) must be set in .env');
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });
  }
  return transporter;
}

/**
 * Send an email via Gmail.
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 * @param {string} [options.replyTo] - Reply-To header (optional)
 */
async function sendMail({ to, subject, text, html, replyTo }) {
  const transport = getTransporter();
  const mailOptions = {
    from: GMAIL_USER,
    to,
    subject,
    text
  };
  if (html) mailOptions.html = html;
  if (replyTo) mailOptions.replyTo = replyTo;

  return transport.sendMail(mailOptions);
}

module.exports = {
  sendMail,
  NOTIFY_EMAIL,
  GMAIL_USER,
  GMAIL_APP_PASSWORD
};
