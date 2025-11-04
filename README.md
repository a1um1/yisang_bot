# Yisang Bot

Simple Discord bot that responds to `/yisang` (or your configured prefix) by fetching a random SFW image from Danbooru and posting it to the channel.

Features
- Random SFW image from Danbooru (rating:safe)
- Global cooldown: 2 minutes between uses

Setup
1. Copy `.env.example` to `.env` and fill your `DISCORD_TOKEN`.
2. Install dependencies:

```bash
# macOS / zsh
npm install
```

3. Run in development (requires `ts-node`):

```bash
npm run dev
```

- Notes
- This implementation uses an in-memory global cooldown (process-level). If you restart the bot the cooldown resets.
- Danbooru requires a polite User-Agent in requests; the bot sets one automatically.
-- Command example: `/yisang` (or set `PREFIX` in `.env` to change it)
# yisang_bot

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.0. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
