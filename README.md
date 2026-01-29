# Anime Compass

Next.js + TypeScript starter for the Anime discovery platform using Jikan API v4.

## Setup

1. Install deps: `npm install` or `pnpm install`
2. Run dev: `npm run dev`

API: https://api.jikan.moe/v4

This scaffold contains placeholder pages and components. Follow TODO comments to implement features. See `copilot-instructions.md` in `.github` for task guidance.

---

## Notes & Next steps

- The project uses `@tanstack/react-query` for caching and loading states. Replace placeholder skeletons with more specific shapes where needed.
- Add unit/e2e tests as required.
- The Jikan API is public; watch rate limits (429). The `lib/api.ts` file contains basic parsing for 429 and network errors.

