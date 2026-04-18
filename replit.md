# Marketplace — AI Creator Platform

## Overview

A professional SaaS platform connecting Indian brands with content creators via an AI recommendation engine. Features a deep dark slate + amber/gold theme, Indian Rupee (INR) currency, interactive 3D analytics charts, real-time messaging, escrow payments, and full account/settings management.

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
- **Charts**: Recharts + Three.js (@react-three/fiber, @react-three/drei)
- **Animations**: Framer Motion

## Features

- Creator profiles with analytics (follower growth, earnings, campaign performance)
- AI recommendation engine (scoring based on engagement, followers, category match)
- Campaign management (post, browse, apply, manage)
- Real-time messaging (conversations + messages)
- Payment system with escrow flow (pending → escrow → released)
- Platform analytics dashboard (stats, category breakdown, activity feed)
- Dark professional theme: deep slate (222 26% 8%) + amber/gold primary, no gradients
- INR currency throughout (₹, Lakhs, Crores)
- Transparent backdrop-blur navbar + landscape-responsive layout
- Interactive 3D bar charts in Analytics (with WebGL fallback to 2D)
- Settings page: Profile, Notifications, Security, Billing, Activity Log tabs
- Real-time message polling (5s interval) with unread badges and online status
- "Marketplace" branding throughout (replaced "CreatorMatch")

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
