# DJ03 Booking API

Backend for the DJ03 website booking form. Handles form submissions and sends email notifications via Gmail.

## Setup

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=yourgmail@gmail.com
PORT=5000
```

**Gmail App Password:**  
Use a [Gmail App Password](https://support.google.com/accounts/answer/185833), not your regular password. Enable 2-Step Verification first, then create an app password.

### 3. Run the server

```bash
npm start
```

The API runs at `http://localhost:5000`.

## API

- **POST** `/api/book` – Submit a booking (expects JSON body with: fullName, email, phone, eventType, eventDate, eventLocation, eventDetails, budget optional)
- **GET** `/api/health` – Health check

## Frontend

The Book Me page (`booknow.html`) sends requests to `http://localhost:5000` by default. To use a different API URL, set `window.DJ03_API_URL` before the page loads, e.g.:

```html
<script>window.DJ03_API_URL = 'https://your-api-domain.com';</script>
```

For local testing, open `booknow.html` with a local server (e.g. Live Server on port 5500) so CORS works correctly.
