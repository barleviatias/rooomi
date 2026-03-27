# Remove Notifications Tab — Integrate into Matches & Messages

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the dedicated Notifications tab and surface notification information where it naturally belongs — new match counts as a badge on the Matches tab with a highlighted "new" section, while messages and open house invites already live in the Messages tab.

**Architecture:** Replace the notification-store (which drove the notifications tab badge) with a match-store that tracks which match IDs the user has seen. The Matches tab badge shows the count of unseen matches. When the user visits the Matches page, all current matches are marked as "seen" and the badge clears. The notifications DB table and push service are kept for native push notifications.

**Tech Stack:** Zustand (persisted store), React Query, React Router, i18next

---

### Task 1: Create match-store for tracking seen matches

**Files:**
- Create: `src/lib/store/match-store.ts`

**Step 1: Create the store**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MatchStoreState {
  seenMatchIds: string[]
  markMatchesSeen: (ids: string[]) => void
  getUnseenCount: (currentMatchIds: string[]) => number
  reset: () => void
}

export const useMatchStore = create<MatchStoreState>()(
  persist(
    (set, get) => ({
      seenMatchIds: [],
      markMatchesSeen: (ids) =>
        set({ seenMatchIds: [...new Set([...get().seenMatchIds, ...ids])] }),
      getUnseenCount: (currentMatchIds) => {
        const seen = new Set(get().seenMatchIds)
        return currentMatchIds.filter((id) => !seen.has(id)).length
      },
      reset: () => set({ seenMatchIds: [] }),
    }),
    {
      name: 'roomi-matches',
      version: 1,
    }
  )
)
```

**Step 2: Export from store index**

In `src/lib/store/index.ts`, add:
```typescript
export { useMatchStore } from './match-store'
```

And remove:
```typescript
export { useNotificationStore } from './notification-store'
```

**Step 3: Commit**

```bash
git add src/lib/store/match-store.ts src/lib/store/index.ts
git commit -m "feat: add match-store for tracking seen matches"
```

---

### Task 2: Create useUnseenMatchCount hook

**Files:**
- Modify: `src/hooks/useMatches.ts`

**Step 1: Add the hook**

Add to the bottom of `src/hooks/useMatches.ts`:

```typescript
import { useMatchStore } from '@/lib/store/match-store'

export function useUnseenMatchCount() {
  const { user, useMockData } = useAuthStore()
  const { getUnseenCount } = useMatchStore()

  const { data: matchedData } = useQuery({
    queryKey: ['seekerMatches', user?.id, 'matched'],
    queryFn: async () => {
      if (useMockData || !user) {
        return mockMatches.filter(m => m.seeker_id === user?.id && m.status === 'matched')
      }
      return matchesService.getSeekerMatches(user.id, 'matched')
    },
    enabled: !!user,
  })

  const matchIds = (matchedData || []).map((m: { id: string }) => m.id)
  return getUnseenCount(matchIds)
}
```

Note: This hook reuses the same query key as `useSeekerMatches('matched')` so it shares the cache — no extra network request.

**Step 2: Commit**

```bash
git add src/hooks/useMatches.ts
git commit -m "feat: add useUnseenMatchCount hook"
```

---

### Task 3: Update BottomNav — remove notifications, add matches badge

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

**Step 1: Update imports**

Remove:
```typescript
import { Notification03Icon } from '@hugeicons/core-free-icons'
import { useNotificationStore } from '@/lib/store/notification-store'
```

Add:
```typescript
import { useUnseenMatchCount } from '@/hooks/useMatches'
```

**Step 2: Update nav items — remove notifications from both arrays**

Seeker nav (remove line with `/notifications`):
```typescript
const seekerNavItems = [
  { path: '/', icon: Home01Icon, label: 'nav.feed' },
  { path: '/matches', icon: FavouriteIcon, label: 'nav.matches' },
  { path: '/messages', icon: Message01Icon, label: 'nav.messages' },
  { path: '/profile', icon: UserIcon, label: 'nav.profile' },
]
```

Host nav (remove line with `/notifications`):
```typescript
const hostNavItems = [
  { path: '/', icon: FavouriteIcon, label: 'host.newLikes' },
  { path: '/host', icon: DashboardSpeed01Icon, label: 'host.dashboard' },
  { path: '/messages', icon: Message01Icon, label: 'nav.messages' },
  { path: '/profile', icon: UserIcon, label: 'nav.profile' },
]
```

**Step 3: Update badge logic**

Replace the badge logic:
```typescript
export function BottomNav({ transparent = false }: BottomNavProps) {
  const { t } = useTranslation()
  const { activeMode, isAuthenticated } = useAuthStore()
  const messageUnread = useUnreadMessageCount()
  const unseenMatches = useUnseenMatchCount()
  const navItems = isAuthenticated && activeMode === 'host' ? hostNavItems : seekerNavItems

  const getBadgeCount = (path: string): number => {
    if (path === '/matches') return unseenMatches
    if (path === '/messages') return messageUnread
    return 0
  }
```

**Step 4: Clean up unused import**

Remove `Notification03Icon` from the hugeicons import line (only if no longer used elsewhere in this file — it isn't).

**Step 5: Commit**

```bash
git add src/components/layout/BottomNav.tsx
git commit -m "feat: remove notifications tab, add unseen matches badge"
```

---

### Task 4: Update MatchesPage — add "New" section and mark seen on visit

**Files:**
- Modify: `src/pages/matches/MatchesPage.tsx`

**Step 1: Add import**

```typescript
import { useMatchStore } from '@/lib/store/match-store'
```

**Step 2: Add seen-tracking logic inside the component**

After the existing hooks, add:

```typescript
const { seenMatchIds, markMatchesSeen } = useMatchStore()

const newMatches = activeMatches.filter((m) => !seenMatchIds.includes(m.id))
const previousMatches = activeMatches.filter((m) => seenMatchIds.includes(m.id))

useEffect(() => {
  if (activeMatches.length > 0) {
    markMatchesSeen(activeMatches.map((m) => m.id))
  }
}, [activeMatches, markMatchesSeen])
```

Add `useEffect` to the imports from React:
```typescript
import { useEffect } from 'react'
```

**Step 3: Replace the active matches section rendering**

Replace the existing `{activeMatches.length > 0 ? (` section with a version that shows new matches first with a highlight. The new matches section uses `bg-primary/5 border-primary/20 ring-1 ring-primary/10` styling and a "New" badge. The previous matches section stays as-is.

The section becomes:

```tsx
{newMatches.length > 0 ? (
  <section>
    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
      {t('matches.newMatches')}
      <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
        {newMatches.length}
      </Badge>
    </h2>
    <div className="space-y-3">
      {newMatches.map((match) => (
        <Card key={match.id} className="overflow-hidden ring-1 ring-primary/20 bg-primary/5">
          {/* Same card content as active matches - extract to MatchCard if desired */}
          <div className="flex items-stretch">
            {match.property?.photos?.[0] ? (
              <img
                src={match.property.photos[0].photo_url}
                alt={match.property.title}
                className="w-24 h-auto object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 bg-muted flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
                </svg>
              </div>
            )}
            <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold truncate">{match.property?.title}</p>
                  <span className="text-lg font-bold text-primary flex-shrink-0">
                    ₪{match.property?.price_monthly.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {match.property?.address_neighborhood}
                  {match.property?.address_city ? `, ${match.property.address_city}` : ''}
                </p>
                {match.host ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    {match.host.avatar_url ? (
                      <img src={match.host.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      {match.host.display_name || match.host.full_name}
                    </span>
                  </div>
                ) : null}
              </div>
              <Button
                size="sm"
                className="mt-2 w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                onClick={() => handleStartChat(match)}
                disabled={startConversation.isPending}
              >
                <svg className="w-4 h-4 me-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('matches.startChatting')}
              </Button>
            </div>
          </div>
          {match.matched_at ? (
            <div className="px-3 pb-2">
              <p className="text-xs text-muted-foreground">
                {t('matches.itsAMatch')} {formatDistanceToNow(new Date(match.matched_at), { addSuffix: true })}
              </p>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  </section>
) : null}

{previousMatches.length > 0 ? (
  <section>
    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
      {t('matches.active')}
      <Badge className="bg-green-500 text-white border-0">{previousMatches.length}</Badge>
    </h2>
    <div className="space-y-3">
      {previousMatches.map((match) => (
        /* Same card rendering as original activeMatches — identical JSX */
        <Card key={match.id} className="overflow-hidden">
          {/* ... exact same card content as before ... */}
        </Card>
      ))}
    </div>
  </section>
) : null}
```

Note: Since the card content is duplicated, extract a `MatchCard` component inline in the same file to keep it DRY.

**Step 4: Commit**

```bash
git add src/pages/matches/MatchesPage.tsx
git commit -m "feat: add new matches section with seen tracking"
```

---

### Task 5: Update AppShell — remove notification hooks

**Files:**
- Modify: `src/components/layout/AppShell.tsx`

**Step 1: Remove notification imports and hooks**

Remove:
```typescript
import { useUnreadNotificationCount, useRealtimeNotifications } from '@/hooks/useNotifications';
```

Remove from function body:
```typescript
useUnreadNotificationCount();
useRealtimeNotifications();
```

The file should become:
```typescript
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { LoginModal } from '@/features/auth/components/LoginModal';
import { cn } from '@/lib/utils';

export function AppShell() {
	const location = useLocation();
	const isFeedPage = location.pathname === '/';

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<main
				className={cn('flex-1')}
				style={!isFeedPage ? { paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' } : undefined}
			>
				<Outlet />
			</main>
			<BottomNav />
			<LoginModal />
		</div>
	);
}
```

**Step 2: Commit**

```bash
git add src/components/layout/AppShell.tsx
git commit -m "refactor: remove notification hooks from AppShell"
```

---

### Task 6: Remove notifications route and page

**Files:**
- Modify: `src/app/Router.tsx`
- Delete: `src/pages/notifications/NotificationsPage.tsx`

**Step 1: Remove from Router**

In `src/app/Router.tsx`, remove:
```typescript
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
```

And remove the route:
```typescript
<Route path="/notifications" element={<NotificationsPage />} />
```

**Step 2: Delete the page file**

```bash
rm src/pages/notifications/NotificationsPage.tsx
rmdir src/pages/notifications 2>/dev/null || true
```

**Step 3: Commit**

```bash
git add -A src/app/Router.tsx src/pages/notifications/
git commit -m "refactor: remove notifications page and route"
```

---

### Task 7: Clean up notification-store and unused hooks

**Files:**
- Delete: `src/lib/store/notification-store.ts`
- Modify: `src/hooks/useNotifications.ts` — keep only what push.ts needs
- Modify: `src/lib/services/push.ts` — update import

**Step 1: Delete notification-store**

```bash
rm src/lib/store/notification-store.ts
```

**Step 2: Simplify useNotifications.ts**

The file `src/hooks/useNotifications.ts` exports hooks only used by the now-deleted NotificationsPage and AppShell. The only remaining consumer is `push.ts` which directly imports from the store. Since the store is deleted, update push.ts to not depend on notification-store.

Delete `src/hooks/useNotifications.ts`:
```bash
rm src/hooks/useNotifications.ts
```

**Step 3: Update push.ts**

In `src/lib/services/push.ts`, remove:
```typescript
import { useNotificationStore } from '../store/notification-store'
```

And remove the line in `pushNotificationReceived` that calls `incrementUnreadCount`:
```typescript
const foregroundListener = await PushNotifications.addListener('pushNotificationReceived', () => {
  useNotificationStore.getState().incrementUnreadCount()
})
```

Replace with a no-op or badge update (the foreground listener can simply be removed if there's nothing to increment):
```typescript
const foregroundListener = await PushNotifications.addListener('pushNotificationReceived', () => {
  // Push notifications are handled by the OS notification tray
})
```

**Step 4: Commit**

```bash
git add -A src/lib/store/notification-store.ts src/hooks/useNotifications.ts src/lib/services/push.ts src/lib/store/index.ts
git commit -m "refactor: remove notification-store and unused notification hooks"
```

---

### Task 8: Update translations

**Files:**
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/he.json`

**Step 1: Update en.json**

Remove from `nav`:
```json
"notifications": "Alerts",
```

Add to `matches`:
```json
"newMatches": "New Matches"
```

Remove the entire `notifications` section:
```json
"notifications": {
  "title": "Notifications",
  "markAllRead": "Mark all as read",
  "noNotifications": "No notifications yet",
  "noNotificationsDesc": "Your activity updates will appear here"
},
```

**Step 2: Update he.json**

Remove from `nav`:
```json
"notifications": "התראות",
```

Add to `matches`:
```json
"newMatches": "התאמות חדשות"
```

Remove the entire `notifications` section:
```json
"notifications": {
  "title": "התראות",
  "markAllRead": "סמן הכל כנקרא",
  "noNotifications": "אין התראות עדיין",
  "noNotificationsDesc": "עדכוני הפעילות שלך יופיעו כאן"
},
```

**Step 3: Commit**

```bash
git add src/i18n/en.json src/i18n/he.json
git commit -m "chore: update translations — remove notifications, add new matches"
```

---

### Task 9: Verify build

**Step 1: Run lint and build**

```bash
bun run lint
bun run build
```

Expected: No errors. If there are unused import warnings from the removed notification-store, fix them.

**Step 2: Commit any lint fixes**

```bash
git add -A
git commit -m "fix: resolve lint issues from notifications removal"
```

---

## Files Summary

| Action | File |
|--------|------|
| Create | `src/lib/store/match-store.ts` |
| Modify | `src/lib/store/index.ts` |
| Modify | `src/hooks/useMatches.ts` |
| Modify | `src/components/layout/BottomNav.tsx` |
| Modify | `src/pages/matches/MatchesPage.tsx` |
| Modify | `src/components/layout/AppShell.tsx` |
| Modify | `src/app/Router.tsx` |
| Modify | `src/lib/services/push.ts` |
| Modify | `src/i18n/en.json` |
| Modify | `src/i18n/he.json` |
| Delete | `src/pages/notifications/NotificationsPage.tsx` |
| Delete | `src/lib/store/notification-store.ts` |
| Delete | `src/hooks/useNotifications.ts` |
| Keep   | `src/lib/services/notifications.ts` (still used for push + createNotification) |

## What's Preserved

- `notifications` DB table — still used for push notifications
- `src/lib/services/notifications.ts` — `createNotification()` still called from `matches.ts` service, push token management still works
- `src/lib/services/push.ts` — native push still works, just no longer increments an in-app counter
