# Quorix Vietnam

Quorix Vietnam is a Hugo-based website that combines:
- Technical content (posts, projects, services)
- A custom UI layer built on top of PaperMod and Quorix UI
- AI-assisted search/chat endpoint for content discovery

## Tech Stack

- Hugo (theme: PaperMod via git submodule)
- Vercel for deployment
- Node.js serverless function for AI search/chat: `api/ai-search.js`

## Prerequisites

- Hugo Extended 0.146.0 or newer
- Git
- Optional: Vercel CLI for local API testing

## Quick Start

1. Clone repository and initialize submodules:
   - `git submodule update --init --recursive`
2. Create environment file from template:
   - `copy .env.example .env` (Windows)
3. Start Hugo dev server:
   - `hugo server -D`
4. Open http://localhost:1313

## Build

- Production build:
  - `hugo --minify`

## Deploy

The project is configured for Vercel via `vercel.json`:
- buildCommand: `hugo --minify`
- outputDirectory: `public`

## Environment Variables

See `.env.example` for all supported variables.

Notes:
- You can configure one or multiple API keys per provider.
- Provider rotation order is configurable.
- Do not commit real keys to the repository.

## License

This repository uses split licensing:
- Source code and configuration are licensed under the MIT License. See `LICENSE`.
- Original content under `content/` is licensed under CC BY-NC 4.0 unless stated otherwise in a specific file.
- Third-party components keep their own licenses (for example, PaperMod in `themes/PaperMod`).

CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
