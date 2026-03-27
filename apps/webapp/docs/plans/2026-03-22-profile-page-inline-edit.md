# Profile Page Inline Edit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the ProfilePage with inline read/edit mode toggle, showing all lifestyle and preferences in read mode, and delete the separate EditProfilePage.

**Architecture:** Single ProfilePage component with `isEditing` boolean state. Read mode displays all data as formatted text/badges/dots. Edit mode swaps each element to its editable counterpart (inputs, switches, sliders, selects). Settings and logout are always visible outside the edit flow. New roommate preferences section exposes previously hidden DB fields.

**Tech Stack:** React, Zustand, shadcn/ui (Switch, Slider, Select, Input, Textarea), Tailwind CSS, i18next

---

### Task 1: Add new translation keys

**Files:**
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/he.json`

**Step 1: Add keys to en.json profile section**

Add these keys to the `"profile"` object (after `"yesSwitch"`):

```json
"roommate": "Roommate",
"smokerOk": "Smoker OK",
"petOk": "Pet OK",
"kosherRequired": "Kosher required",
"preferredGender": "Preferred gender",
"ageRange": "Age range",
"noPreference": "No preference",
"noPreferencesSet": "No preferences set",
"addBio": "Add a bio...",
"addInstagram": "Add Instagram",
"cancel": "Cancel",
"save": "Save",
"safeRoom": "Safe room",
"male": "Male",
"female": "Female",
"other": "Other",
"minAge": "Min age",
"maxAge": "Max age"
```

**Step 2: Add keys to he.json profile section**

Add matching Hebrew keys:

```json
"roommate": "שותף/ה לדירה",
"smokerOk": "מעשן/ת בסדר",
"petOk": "חיית מחמד בסדר",
"kosherRequired": "שומר/ת כשרות נדרש",
"preferredGender": "מגדר מועדף",
"ageRange": "טווח גילאים",
"noPreference": "ללא העדפה",
"noPreferencesSet": "לא הוגדרו העדפות",
"addBio": "הוסף/י ביו...",
"addInstagram": "הוסף/י אינסטגרם",
"cancel": "ביטול",
"save": "שמירה",
"safeRoom": "ממ\"ד",
"male": "גבר",
"female": "אישה",
"other": "אחר",
"minAge": "גיל מינימום",
"maxAge": "גיל מקסימום"
```

**Step 3: Commit**

```bash
git add src/i18n/en.json src/i18n/he.json
git commit -m "feat: add profile roommate and inline-edit translation keys"
```

---

### Task 2: Rewrite ProfilePage with read/edit modes

**Files:**
- Modify: `src/pages/profile/ProfilePage.tsx` (complete rewrite)

This is the main task. The file is a complete rewrite of the existing ProfilePage. The new page has these sections:

**Imports needed:**
```typescript
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuthStore, useUIStore, useFeedStore, type ActiveMode } from '@/lib/store'
import { cn } from '@/lib/utils'
```

**Constants (outside component):**
```typescript
const CITIES = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Netanya', 'Herzliya', 'Ramat Gan']
const GENDERS = ['male', 'female', 'other']
```

**Component structure:**

The component has:
1. `isEditing` boolean state
2. All the local form states (same as current EditProfilePage — displayName, bio, instagram, all lifestyle fields, all seeker preference fields, PLUS the new roommate fields: roommateSmokerOk, roommatePetOk, roommateKosherRequired, preferredGender, preferredAgeMin, preferredAgeMax, mustHaveSafeRoom)
3. `enterEditMode()` — snapshots current store values into local state, sets `isEditing = true`
4. `cancelEdit()` — sets `isEditing = false` (discards local state changes)
5. `handleSave()` — calls updateProfile, updateLifestyle, updateSeekerPreferences, then sets `isEditing = false`
6. All the existing mode switch logic (showModeModal, pendingMode, confirmModeChange, cancelModeChange)

**Header:**
- Read mode: title "Profile", right side: "Edit" button
- Edit mode: title "Edit Profile", left side: "Cancel" button, right side: "Save" button

**Section rendering pattern — each section has read/edit variants:**

#### Helper: DotIndicator component (inline, before the export)

```tsx
function DotIndicator({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={cn(
            'w-2.5 h-2.5 rounded-full',
            i < value ? color : 'bg-muted'
          )}
        />
      ))}
    </div>
  )
}
```

#### Section 1: Profile Header

**Read mode:**
- Avatar with verification badge (same as current)
- Display name (bold text)
- Bio text (muted, or "Add a bio..." placeholder in muted italic if empty)
- Instagram as `@handle` tappable text (or "Add Instagram" placeholder if empty)

**Edit mode:**
- Avatar with camera overlay button
- Display name → Input
- Bio → Textarea
- Instagram → Input with @username placeholder

#### Section 2: Lifestyle Card

**Read mode:**
- Title: "Lifestyle"
- Row of colored pills for ACTIVE traits only:
  - If `is_smoker`: `🚬 Smoker` (red-ish pill) else `🚭 Non-smoker` (green-ish pill)
  - Always show smoking status. For others, only show if active:
  - If `has_pet`: `🐾 Has pet`
  - If `keeps_kosher`: `✡️ Kosher`
  - If `is_student`: `🎓 Student`
- 4 rows with label + DotIndicator:
  - Hosting: label, 5 dots (bg-primary)
  - Sleep: "Night owl" label ← dots → "Early bird" label, 5 dots (bg-blue-500)
  - Cleanliness: label, 5 dots (bg-emerald-500)
  - Noise: label, 5 dots (bg-amber-500)

**Edit mode:**
- Title: "Lifestyle"
- 2x2 grid of switch toggles (same as current EditProfilePage lifestyle toggles)
- 4 sliders with labels (same as current EditProfilePage lifestyle sliders)

#### Section 3: Seeker Preferences Card (only when `activeMode === 'seeker' || user.is_seeker`)

**Read mode:**
- Title: "Preferences"
- Budget: `₪2,000 – ₪6,000` formatted text
- City: city name as text
- Must-haves: row of colored pills for active ones only. Each pill shows the amenity name. Colors:
  - Balcony: `bg-green-100 text-green-700`
  - Elevator: `bg-blue-100 text-blue-700`
  - Parking: `bg-purple-100 text-purple-700`
  - A/C: `bg-cyan-100 text-cyan-700`
  - Furnished: `bg-amber-100 text-amber-700`
  - Pets allowed: `bg-pink-100 text-pink-700`
  - Safe room: `bg-red-100 text-red-700`
- If no must-haves active: "No preferences set" in muted text

**Edit mode:**
- Same as current EditProfilePage preferences section
- PLUS: add safe room toggle to the must-haves grid

#### Section 4: Roommate Preferences Card (only when `activeMode === 'seeker' || user.is_seeker`)

**Read mode:**
- Title: "Roommate"
- Row of pills for active prefs:
  - If `roommate_smoker_ok`: "Smoker OK" pill
  - If `roommate_pet_ok`: "Pet OK" pill
  - If `roommate_kosher_required`: "Kosher required" pill
- Preferred gender (if set and not empty): "Preferred: Male" text
- Age range (if set): "Ages 20–30" text
- If nothing set: "No preferences set" muted text

**Edit mode:**
- 3 switch toggles: Smoker OK, Pet OK, Kosher required
- Gender dropdown select (male/female/other/no preference)
- Age range: two number inputs (min/max)

#### Sections 5-7: Settings, Logout, Mode Modal (unchanged from current ProfilePage)

These sections are NOT part of the edit flow. They render identically in both read and edit mode. Keep the exact current implementation for:
- Role switcher (segmented control)
- Settings card (language toggle, reset feed)
- Logout button
- Mode switch confirmation modal

**Step 1: Write the complete new ProfilePage**

Write the full file with all sections. The file will be long (~400-500 lines) but it's a single self-contained page component.

Key implementation details:
- `enterEditMode` function initializes ALL local state from store values
- Local state for new roommate fields:
  ```typescript
  const [roommateSmokerOk, setRoommateSmokerOk] = useState(true)
  const [roommatePetOk, setRoommatePetOk] = useState(true)
  const [roommateKosherRequired, setRoommateKosherRequired] = useState(false)
  const [preferredGender, setPreferredGender] = useState('')
  const [preferredAgeMin, setPreferredAgeMin] = useState<number | undefined>(undefined)
  const [preferredAgeMax, setPreferredAgeMax] = useState<number | undefined>(undefined)
  const [mustHaveSafeRoom, setMustHaveSafeRoom] = useState(false)
  ```
- `handleSave` includes the new fields in updateSeekerPreferences:
  ```typescript
  updateSeekerPreferences({
    ...existingFields,
    must_have_safe_room: mustHaveSafeRoom,
    roommate_smoker_ok: roommateSmokerOk,
    roommate_pet_ok: roommatePetOk,
    roommate_kosher_required: roommateKosherRequired,
    preferred_gender: preferredGender || undefined,
    preferred_age_min: preferredAgeMin,
    preferred_age_max: preferredAgeMax,
  })
  ```

**Step 2: Commit**

```bash
git add src/pages/profile/ProfilePage.tsx
git commit -m "feat: rewrite ProfilePage with inline read/edit mode"
```

---

### Task 3: Delete EditProfilePage and its route

**Files:**
- Delete: `src/pages/profile/EditProfilePage.tsx`
- Modify: `src/app/Router.tsx`

**Step 1: Remove from Router**

In `src/app/Router.tsx`, remove the lazy import:
```typescript
const EditProfilePage = lazy(() => import('@/pages/profile/EditProfilePage').then(m => ({ default: m.EditProfilePage })))
```

Remove the route:
```typescript
<Route path="/profile/edit" element={<EditProfilePage />} />
```

**Step 2: Delete the file**

```bash
rm src/pages/profile/EditProfilePage.tsx
```

**Step 3: Commit**

```bash
git add -A src/pages/profile/EditProfilePage.tsx src/app/Router.tsx
git commit -m "refactor: delete EditProfilePage, all editing is inline now"
```

---

### Task 4: Verify build and fix issues

**Step 1: Run build**

```bash
bun run build
```

Expected: Clean build, exit 0.

**Step 2: Check for any remaining references to EditProfilePage or /profile/edit**

```bash
grep -r "EditProfilePage\|profile/edit" src/
```

Expected: No results. If any found, fix them.

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve any issues from profile page rewrite"
```

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `src/i18n/en.json` |
| Modify | `src/i18n/he.json` |
| Modify | `src/pages/profile/ProfilePage.tsx` (complete rewrite) |
| Modify | `src/app/Router.tsx` |
| Delete | `src/pages/profile/EditProfilePage.tsx` |
