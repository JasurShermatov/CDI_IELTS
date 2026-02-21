# CDI IELTS - Frontend

Modern Next.js frontend for the CDI IELTS practice platform with IELTS-themed design (red and white colors).

## Features

- 🔐 Authentication (Login/Register with OTP)
- 📊 Student Dashboard with balance display
- 📚 Browse and purchase IELTS tests
- ✍️ Take tests (Listening, Reading, Writing)
- 📈 View test results and scores
- 💳 Top-up balance via Click payment
- 🗣️ Request speaking sessions
- 👨‍🏫 Teacher dashboard for checking submissions
- 🎨 Modern UI with IELTS red and white theme

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Axios for API calls

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8700/api
```

### Docker

The frontend is included in the main docker-compose.yml:

```bash
cd ..
docker-compose up frontend
```

## Project Structure

- `/app` - Next.js pages and routes
- `/components` - Reusable components (Navbar)
- `/lib` - API client, types, and utilities
- `/public` - Static assets

## API Integration

All backend endpoints are connected:

- `/api/accounts/*` - Authentication
- `/api/profiles/*` - User profiles
- `/api/tests/*` - Test management
- `/api/user-tests/*` - User test purchases
- `/api/payments/*` - Top-up functionality
- `/api/speaking/*` - Speaking requests
- `/api/teacher-checking/*` - Writing submissions

## Design Theme

IELTS-branded colors:
- Primary Red: `#dc2626`
- Dark Red: `#b91c1c`
- Light Red: `#fee2e2`
- White backgrounds with red accents

## Mock Data Mode

For UI demos without backend data, enable mock mode:

```env
NEXT_PUBLIC_USE_MOCKS=true
```

When enabled, pages will show realistic demo data and simulated actions.
