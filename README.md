<div align="center">

# 🚀 Maxifyfx Intelligence Terminal

**Professional-grade real-time market intelligence aggregator with institutional-depth MT5 trading signals.**

Powered by **Claude AI (Anthropic)**

</div>

## Features

- 📊 Real-time economic calendar with AI-generated analysis
- 🌐 Arabic & English language support
- 📅 Customizable date range & impact filter
- 💡 Institutional playbooks for every event
- 📱 Fully responsive (desktop + mobile)

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the example env file and set your Anthropic API key:
   ```
   cp .env.example .env.local
   ```
   Then edit `.env.local` and set:
   ```
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```
   Get your API key from [console.anthropic.com](https://console.anthropic.com)

3. Run the app:
   ```
   npm run dev
   ```

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **Framer Motion** (animations)
- **Anthropic Claude API** (AI intelligence)
- **Lucide React** (icons)

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | Your Anthropic API key from console.anthropic.com |

## Disclaimer

This application is for educational and informational purposes only. Not financial advice.
