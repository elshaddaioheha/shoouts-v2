# Phase 2 Marketplace Firestore Contract

This project currently reads marketplace data from:

- `collectionGroup('uploads')` with `where('isPublic', '==', true)` and ranking/sorting variants.
- `collection('users/{uid}/uploads')` for seller-specific reads.
- `collectionGroup('uploads')` with seller-id field fallbacks (`uploaderId`, `sellerId`, `ownerId`, `userId`, `uid`).
- `collection('uploads')` by direct document id for detail lookups.

## Expected Query Behavior

The app now intentionally falls back when advanced indexes are missing:

1. Try ranked queries:
- `isPublic == true` + `orderBy(publishedAt desc)`
- `isPublic == true` + `orderBy(listenCount desc)`
- `isPublic == true` + `orderBy(createdAt desc)`

2. If ranking indexes are unavailable, fallback to:
- `isPublic == true` with no `orderBy`, then sort client-side.

This keeps Home/Explore/Detail/Profile surfaces resilient on mixed backend setups.

## Required Firestore Indexes (Recommended)

Create composite indexes for the `uploads` collection group:

1. `isPublic` Asc, `publishedAt` Desc
2. `isPublic` Asc, `listenCount` Desc
3. `isPublic` Asc, `createdAt` Desc
4. For seller lookups (if used in production rules):
- `isPublic` Asc + each seller key used for filtering:
  - `uploaderId`
  - `sellerId`
  - `ownerId`
  - `userId`
  - `uid`

## Rules Expectations

Public marketplace reads should allow:

- Read on published/public upload docs used by `collectionGroup('uploads')`.
- Read on `users/{uid}/uploads` for public listings.
- Read on seller profile sources (`users/{uid}` and optional `sellers/{uid}`) for public storefronts.

If rules block one path, the app logs scoped fallback diagnostics and continues with alternate read paths where possible.
