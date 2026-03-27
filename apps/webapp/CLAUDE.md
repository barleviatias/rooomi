# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Roomi** is a roommate and apartment matching platform with a TikTok-style vertical scroll feed. Built as a web app with **Capacitor** for native iOS/Android deployment. Users browse properties in a full-screen swipe interface and express interest, which triggers matching when hosts reciprocate.

## Technology Stack

- **Framework**: React 19 + Vite 7 + TypeScript 5.9
- **Native**: Capacitor 8 (iOS + Android)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI primitives)
- **State**: Zustand (persisted stores for auth, feed, UI)
- **Server State**: TanStack React Query v5
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **i18n**: i18next (Hebrew RTL + English LTR)
- **Icons**: HugeIcons

## Environments

Two Supabase backends controlled by `VITE_APP_ENV`:
- **staging** (default) - Cloud Supabase for development/testing
- **production** - Cloud Supabase for live app

Each has its own `VITE_{ENV}_SUPABASE_URL` and `VITE_{ENV}_SUPABASE_ANON_KEY`.

## Development Commands

```bash
# Web development
bun run dev              # Dev server (staging Supabase)
bun run dev:prod         # Dev server (production Supabase)
bun run build            # Build for staging
bun run build:prod       # Build for production
bun run preview          # Preview production build
bun run lint             # ESLint checking

# Capacitor (native)
bun run cap:sync         # Sync web assets to native projects
bun run cap:ios          # Open Xcode project
bun run cap:android      # Open Android Studio project
bun run mobile:ios       # Build + sync + open iOS
bun run mobile:android   # Build + sync + open Android
```

## Architecture

### Feature-Based Organization
```
src/
├── features/           # Self-contained feature modules
│   ├── auth/          # LoginModal, auth hooks
│   ├── feed/          # PropertyCard, PropertyFeed, SeekerFeed, etc.
│   └── listings/      # Create/Edit listing flow
├── pages/             # Route page components (10 pages)
├── components/
│   ├── layout/        # AppShell, BottomNav, Header
│   └── ui/            # shadcn/ui primitives (18 components)
├── lib/
│   ├── services/      # Supabase service layer (auth, properties, matches, chat)
│   ├── store/         # Zustand stores (auth-store, feed-store, ui-store)
│   ├── supabase/      # Supabase client (env-aware) and generated types
│   ├── platform.ts    # Capacitor platform detection (isNative, isIOS, isAndroid)
│   └── utils.ts       # cn() utility for class merging
├── hooks/             # Custom hooks (useDirection, useMediaQuery, useProperties, useMatches, useChat, useSafeArea)
├── i18n/              # Translation files (en.json, he.json)
└── types/             # TypeScript type definitions
```

### Native (Capacitor)
```
ios/                   # Xcode project (commit to git)
android/               # Android Studio project (commit to git)
capacitor.config.ts    # Capacitor configuration (appId: com.roomi.app)
```

### State Management (Zustand)
- **auth-store**: User authentication, pending like tracking, mode switching (persisted)
- **feed-store**: Liked/passed property IDs, feed index (persisted)
- **ui-store**: Modal states, selected property

### Key Patterns
- Path alias: `@/*` maps to `./src/*`
- Barrel exports via `index.ts` files
- CSS utility: `cn()` for conditional Tailwind class merging
- RTL support: `useDirection()` hook, Tailwind logical properties (start/end)
- Platform detection: `import { isNative, isIOS, isAndroid } from '@/lib/platform'`
- Environment-aware Supabase: `import { supabase, currentEnv } from '@/lib/supabase'`
- Safe area insets for native: `useSafeArea()` hook + CSS `env(safe-area-inset-*)`

### Capacitor Native Plugins Available
- `@capacitor/app` - App lifecycle, deep links
- `@capacitor/camera` - Photo capture and gallery picker
- `@capacitor/haptics` - Haptic feedback on swipe actions
- `@capacitor/keyboard` - Keyboard management
- `@capacitor/status-bar` - Status bar styling
- `@capacitor/splash-screen` - Launch screen
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/share` - Native share sheet
- `@capacitor/browser` - In-app browser (for OAuth)
- `@capacitor/filesystem` - File system access

## Core User Flow

1. **Feed**: Full-screen vertical scroll through properties (TikTok-style)
2. **Swipe/Tap**: Like via floating buttons or tap for detail sheet
3. **Auth Gate**: Unauthenticated likes trigger login modal
4. **Matching**: Mutual likes create matches enabling chat

## Type System

Key types in `src/types/index.ts`:
- `Property` - Listing with photos, amenities, host reference
- `Profile` - User with preferences, verification status
- `Match` - Seeker-property connection with status
- `Conversation` / `Message` - Chat data structures

## Database Schema (Supabase)

15 tables with RLS policies: profiles, profile_lifestyle, seeker_preferences, properties, property_photos, interactions, matches, conversations, messages, open_houses, open_house_invites, saved_properties, notifications, reports, blocks, property_views

Migrations in `supabase/migrations/`. Types in `src/lib/supabase/types.ts`.

## Deployment

- **Web**: Vercel (vercel.json with SPA rewrites)
- **iOS**: Xcode via Capacitor (`bun run mobile:ios`)
- **Android**: Android Studio via Capacitor (`bun run mobile:android`)

dont write comments when generating code
