# DJ03 – One-Server Dev Setup

Run **one command** to serve the site and API locally:

```bash
npm install
npm run dev
```

Then open: **http://localhost:3000**

- Homepage: http://localhost:3000
- Book Me: http://localhost:3000/booknow.html
- API: POST http://localhost:3000/api/book

**Existing files** (HTML, CSS, images) are served as-is. Nothing is modified.

**Email:** Uses `server/.env` – set `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and optionally `NOTIFY_EMAIL`.
