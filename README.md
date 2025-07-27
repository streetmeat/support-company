<p align="center">
  <img src="public/desktoplogo.png" alt="Support Company" width="700" />
</p>

<p align="center">
  <em>A satirical AI support experience where the tables are turned - AI agents desperately need YOUR help to solve puzzles they can't handle.</em>
</p>

## Hackathon Submission

**Hackathon**: [CS Girlies Hacks 2025](https://csgirlies.devpost.com)  
**Project**: The Support Company  
**Demo**: [support-company.org](https://support-company.org)

## About

Support Company is a comedy project that exploits AI's inability to make subjective human judgments. Our "support agents" start professionally but quickly devolve into anxiety, begging users to help them solve image-based verification tasks that only humans can complete.

### The Experience
1. Land on a generic corporate support page
2. Chat widget auto-opens after 4 seconds
3. AI agent greets professionally, then immediately shows distress
4. Agent reveals they're locked out and need human help
5. User helps solve 3 puzzles that AI can't handle:
   - Identifying real vs AI-generated hands
   - Picking the "f-boy" (subjective social judgment)
   - Selecting the "cutest" image (aesthetic preference)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: OpenRouter (gpt-4o-mini)
- **Streaming**: Vercel AI SDK
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Analytics**: Vercel KV (optional)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/support-company.git
cd support-company
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenRouter API key to `.env.local`:
```
OPENROUTER_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | Your OpenRouter API key for AI chat |
| `KV_REST_API_URL` | No | Vercel KV URL for analytics |
| `KV_REST_API_TOKEN` | No | Vercel KV token for analytics |

## Project Structure

```
support-company/
├── app/                # Next.js app directory
│   ├── api/           # API routes for chat & puzzles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Landing page
├── components/        # React components
│   ├── chat-widget-streaming.tsx
│   ├── puzzle-container.tsx
│   └── puzzle-grid.tsx
├── lib/              # Utilities and AI logic
│   ├── ai/          # AI prompts and configuration
│   └── types/       # TypeScript types
├── public/          # Static assets
│   └── puzzles/     # Puzzle images
└── data/            # Puzzle manifest
```

## Key Features

- **Natural AI Conversation**: Responds intelligently while showing authentic anxiety
- **Progressive Story**: Emotional escalation from professional to desperate
- **Context-Aware Reactions**: Real-time responses to puzzle events
- **Idle Behavior**: Nudges at 15s, 30s, 45s, resignation at 60s
- **Single-Page Experience**: Chat persists throughout all interactions

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel
```

## Contributing

This is a hackathon project created for comedy and demonstration purposes. Feel free to fork and create your own variations!

## Credits

- Initial scaffold from [Vercel AI Chatbot](https://github.com/vercel/ai-chatbot)
- Heavily modified for Support Company's unique experience
- All puzzle logic, story progression, and comedy elements are original

## License

MIT License - See [LICENSE](LICENSE) file

---

Built with ❤️ and anxiety by humans (with a lot help from Claude)
