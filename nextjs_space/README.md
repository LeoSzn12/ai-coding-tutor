
# AI Coding Tutor

An AI-powered coding tutor application for non-technical "vibe coders" featuring real-time video/audio calls with screen sharing, browser extension for code context capture, AI agent for error explanation and suggestions, and session management.

## Features

- 🎥 **Real-time Video/Audio Calls** - Powered by LiveKit for high-quality communication
- 🖥️ **Screen Sharing** - Share your code and debug together
- 🤖 **AI Code Assistant** - Get instant help with errors and suggestions
- 📁 **File Upload** - Share code snippets, images, and files in chat
- 🔐 **Google OAuth** - Secure authentication
- 💾 **Session Management** - Track your coding sessions and progress
- 🔍 **Error Loop Detection** - Identify and break out of coding loops

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Video/Audio**: LiveKit
- **Storage**: AWS S3
- **AI**: Abacus AI
- **UI**: Tailwind CSS + shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- PostgreSQL database
- Google OAuth credentials
- LiveKit account
- AWS S3 bucket
- Abacus AI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai_coding_tutor/nextjs_space
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. Set up the database:
```bash
yarn prisma generate
yarn prisma db push
```

5. Run the development server:
```bash
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

See `.env.example` for required environment variables.

### Getting API Keys

- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/)
- **LiveKit**: [LiveKit Dashboard](https://cloud.livekit.io/)
- **AWS S3**: [AWS Console](https://console.aws.amazon.com/)
- **Abacus AI**: [Abacus AI Platform](https://abacus.ai/)

## Project Structure

```
nextjs_space/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── sessions/          # Session management
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema
└── public/               # Static assets
```

## Deployment

### Replit

1. Import this repository to Replit
2. Set up environment variables in Replit Secrets
3. Run `yarn install` and `yarn dev`

### Vercel

1. Import this repository to Vercel
2. Set up environment variables
3. Deploy

## Known Issues

- Microphone and video permissions may need to be explicitly granted in browser settings
- LiveKit requires HTTPS in production (localhost works for development)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - feel free to use this project for learning and development.
