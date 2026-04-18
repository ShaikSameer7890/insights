# AI Creator Marketplace

## Overview

A professional, startup-grade AI-powered marketplace platform that connects brands with content creators/influencers. Features gradient green UI, AI recommendation engine, real-time data, and full PostgreSQL integration.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/creator-marketplace)
- **Backend**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Charts**: Recharts
- **Animations**: Framer Motion

## Features

- Creator profiles with analytics (follower growth, earnings, campaign performance)
- AI recommendation engine (scoring based on engagement, followers, category match)
- Campaign management (post, browse, apply, manage)
- Real-time messaging (conversations + messages)
- Payment system with escrow flow (pending → escrow → released)
- Platform analytics dashboard (stats, category breakdown, activity feed)
- Gradient green UI theme (emerald-to-teal with glass-morphism cards)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

Tables: `creators`, `campaigns`, `applications`, `conversations`, `messages`, `payments`

## API Routes

- `GET/POST /api/creators` — list and create creators
- `GET/PUT /api/creators/:id` — get and update creator
- `GET /api/creators/top` — AI-ranked top creators
- `GET/POST /api/campaigns` — list and create campaigns
- `GET/PUT /api/campaigns/:id` — get and update campaign
- `GET /api/campaigns/:id/recommend` — AI recommended creators for campaign
- `GET/POST /api/applications` — list and submit applications
- `PUT /api/applications/:id` — accept/reject application
- `GET /api/analytics/dashboard` — dashboard summary stats
- `GET /api/analytics/creator/:id` — creator analytics
- `GET /api/analytics/categories` — category breakdown
- `GET/POST /api/conversations` — messaging conversations
- `GET/POST /api/messages` — messages in a conversation
- `GET/POST /api/payments` — payment records

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
