# Pinbook - Your Personal Pinboard Client

A modern, minimal web client for Pinboard built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Secure Authentication** - Login with your Pinboard API token
- 📚 **Bookmark Management** - View, search, and organize your bookmarks
- 🏷️ **Tag Filtering** - Filter bookmarks by tags
- 🔍 **Smart Search** - Search across titles, descriptions, and URLs
- 📱 **Responsive Design** - Works great on desktop and mobile
- 🌙 **Dark/Light Mode** - Built-in theme support
- 📲 **Telegram Bot** - Save links to Pinboard by sending them in Telegram
- ⚡ **Fast & Reliable** - Built with modern web technologies

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Pinboard account and API token

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pinbook
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting Your Pinboard API Token

1. Go to [Pinboard Settings](https://pinboard.in/settings/password)
2. Copy your API token (format: `username:token`)
3. Use this token to log into Pinbook

### Telegram Bot (Optional)

Save links to Pinboard by sending them to a Telegram bot.

**→ Full step-by-step guide: [docs/TELEGRAM_SETUP.md](docs/TELEGRAM_SETUP.md)**

Short version: create a bot with [@BotFather](https://t.me/BotFather), add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_BOT_USERNAME` (and optionally Redis and webhook secret) to `.env.local`, run `node scripts/set-telegram-webhook.mjs` with your app’s public URL, then in Pinbook go to **Settings → Telegram → Connect Telegram** and send the shown `/start CODE` to your bot.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/pinbook)

### Manual Deployment

```bash
npm run build
npm start
```

## Development

### Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── bookmarks/      # Bookmark-related components
│   ├── layout/         # Layout components
│   └── ui/             # shadcn/ui components
├── lib/                # Utilities and configurations
│   ├── api/            # API clients
│   └── stores/         # Zustand stores
└── types/              # TypeScript type definitions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [Pinboard](https://pinboard.in/) for the excellent API
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Next.js](https://nextjs.org/) for the amazing framework