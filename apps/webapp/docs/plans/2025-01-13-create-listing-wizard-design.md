# Create Listing Wizard - Design Document

## Overview

A 3-step wizard for hosts to create new property listings. Designed to be quick and simple while collecting all necessary information.

## User Flow

1. Host clicks "Create Listing" from Dashboard
2. **Step 1**: Add photos (placeholder implementation)
3. **Step 2**: Enter property details
4. **Step 3**: Review and publish
5. Success modal celebration
6. Redirect to Host Dashboard

## Step Details

### Step 1: Photos

- Grid layout: 2 columns, up to 6 slots visible
- First photo marked as "Cover photo"
- Tapping slot shows "Coming soon" toast (placeholder)
- Can proceed with 0 photos for testing
- **Future**: Full file upload with camera/gallery picker

### Step 2: Details

Single scrollable form with fields:

| Field | Type | Required |
|-------|------|----------|
| Title | Text input | Yes |
| Price (₪/month) | Number input | Yes |
| Deposit (months) | Number input | No |
| City | Select dropdown | Yes |
| Neighborhood | Text input | No |
| Rooms | Number input | No |
| Bathrooms | Number input | No |
| Size (m²) | Number input | No |
| Floor / Total floors | Number inputs | No |
| Available from | Date picker | No |
| Min lease (months) | Select dropdown | No |
| Amenities | Checkbox group | No |
| Bills included | Switch | No |
| Roommates description | Textarea | No |

**Amenities options**: Balcony, A/C, Elevator, Parking, Furnished, Pets allowed, Safe room

### Step 3: Review

- Card preview showing listing appearance
- Summary of all entered details
- "Edit" links to jump back to specific fields
- Big pink "Publish" button

## UI Components

### Progress Dots

```
○───●───○
```

- Pink filled dot for current step
- Gray dots for other steps
- Thin connecting lines

### Navigation

- Top bar: Cancel (left), Progress dots (center), Step indicator (right)
- Bottom: "Back" and "Continue" buttons
- Final step: "Publish" instead of "Continue"
- Cancel triggers confirmation modal

### Success Modal

- Centered modal with celebration icon
- "Your listing is live!" message
- Property title displayed
- Single "Go to Dashboard" button
- Pink gradient styling

## File Structure

```
src/pages/properties/CreateListingPage.tsx
src/features/listings/components/
  ├── CreateListingWizard.tsx
  ├── PhotoUploadStep.tsx
  ├── ListingDetailsStep.tsx
  ├── ListingReviewStep.tsx
  ├── StepProgressDots.tsx
  └── ListingSuccessModal.tsx
```

## State Management

- Form data stored in parent component state
- Passed to steps via props
- On publish: adds to mock data array
- **Future**: Save to Supabase

## Validation

- Step 2 requires: title, price, city
- Inline error messages
- "Continue" button disabled when invalid
- No validation on Step 1 (photos optional)

## Migration Path

**Photo Upload (A → C)**:
1. Current: Placeholder with "Coming soon" toast
2. Future: Replace handler with file picker + cloud upload
3. UI remains unchanged, only implementation swaps

## Translations

Add keys to `en.json` and `he.json`:

```json
{
  "createListing": {
    "title": "Create Listing",
    "step1Title": "Add Photos",
    "step2Title": "Property Details",
    "step3Title": "Review",
    "addPhoto": "Add Photo",
    "coverPhoto": "Cover",
    "comingSoon": "Photo upload coming soon",
    "publish": "Publish Listing",
    "success": "Your listing is live!",
    "goToDashboard": "Go to Dashboard"
  }
}
```

## Design Decisions

1. **3 steps vs 5**: Chose simplicity to reduce drop-off
2. **Progress dots vs labels**: Matches app's minimal aesthetic
3. **Placeholder photos**: Allows building flow now, upgrade later
4. **Success → Dashboard**: Clear completion, shows new listing
