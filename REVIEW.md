# Shoouts V2 — Repo Review

> Living document. Check off items as work is completed. Updated: 2026-05-30.

---

## Architecture Progress

### Completed
- [x] Feature-slice structure (`src/features/<feature>/`)
- [x] Expo Router thin-routing pattern (`app/` = routes only)
- [x] Zustand for client state (auth, account, player, cart, library)
- [x] React Query for server state (marketplace, downloads, vault, admin)
- [x] Role-based access control (`access.config.ts` — single source of truth)
- [x] Design system (`src/theme/` — tokens, colors, spacing, typography)
- [x] Admin panel (users, reports, listings, threads with detail screens)
- [x] Auth flow (onboarding → login → role selection)
- [x] Free track claiming (Firestore entitlement write + local library)
- [x] Audio player (queue, repeat, suppress/unsuppress, seek, mini + full modal)
- [x] Cart with validation hooks and price-change detection
- [x] Suspension gate (blocked users redirected at root)
- [x] Orphaned root-level folders removed (`components/`, `hooks/`, `constants/`, `core/`)
- [x] Route structure fixed (`app/(screens)/` group, dead stub removed)

### In Progress / Partial
- [ ] Vault (list, edit, cover upload done — record, folders, shared are stubs)
- [ ] Studio (home, upload wizard, wallet done — analytics, promote are stubs)
- [ ] Hybrid dashboard (structure done — publish flow is a stub)
- [ ] Chat / messaging (inbox + thread UI done — real-time listener not wired)
- [ ] Downloads screen (real screen done — file delivery not wired)

---

## MVP — Tackle First

These block a real launch. Work top to bottom.

### 1. Firestore Schema Normalization (Blocker)
**Problem:** `marketplace.api.ts` (1,120 lines) and `vault.api.ts` both run N×M fallback
query chains because documents use inconsistent field names across the database:

| Concept | Field variants in use |
|---|---|
| Owner ID | `uploaderId`, `sellerId`, `ownerId`, `userId`, `uid` |
| Visibility | `isPublic`, `public`, `published`, `isPublished` |
| Collection | `uploads`, `vaultProjects`, `projects` |

`fetchMarketplaceListingById` falls back to scanning **300 documents** to find one by ID.
`fetchSellerListings` runs up to **16 sequential Firestore queries** per call.

**Fix:** Run a one-time Firestore migration script to normalize all documents to:
- `uploaderId` for owner
- `isPublished: true/false` for visibility
- `uploads` as the canonical collection

Then collapse each API function to a single deterministic query.

---

### 2. Shared Firestore Utilities (Duplication)
- [x] Extracted to `src/services/firestore/mappers.ts`. `marketplace.api.ts` and `vault.api.ts` now import from there. Note: `admin.api.ts`, `account.api.ts`, `studio.api.ts`, `chat.api.ts`, `downloads.api.ts` still have local copies — migrate those as their files are touched.

---

### 3. Duplicate Marketplace Query (Performance / Cost)
- [x] `MARKETPLACE_FEED_LIMIT = 48` constant exported from `marketplace.hooks.ts`. All callers (`HomeScreen`, `ExploreFeed`, `MarketplaceScreen`, `GlobalPlayerHost`, `FullPlayerModal`) now use the constant → single shared React Query cache entry.

---

### 4. Payment Integration
**Problem:** Paid checkout shows an `InterimFeatureSheet` ("Payment integration is next").
The cart and checkout UI are complete but nothing processes payment.

**What's needed:**
- Choose provider (Stripe recommended — has React Native SDK + webhook support)
- Add `PaymentSheet` trigger in `CheckoutSheet.tsx` for paid items
- Write entitlement to Firestore on `payment_intent.succeeded` webhook
- Wire `useUserPurchases` to return Stripe-sourced entitlements

---

### 5. Cross-Device Entitlement Persistence
**Problem:** Free track claiming writes to Firestore (`claimFreeItems`) but also writes to
`useLibraryStore` (Zustand in-memory). Paid items once integrated have no confirmed
cross-device delivery path. `deliveryStatus: 'local_only'` in the library store confirms
the gap.

**Fix:** `useUserPurchases` (in `downloads.api.ts`) already reads from
`users/{uid}/purchases`. Ensure `claimFreeItems` writes the same schema paid webhooks will
write. Remove `local_only` delivery status once Firestore is the source of truth.

---

## Bugs to Fix

### Critical
- [x] ~~**Double Firestore read on startup**~~ — fixed: all marketplace callers unified to `MARKETPLACE_FEED_LIMIT = 48`.

### High
- [x] ~~**`SectionHeader` recreates StyleSheet every render**~~ — fixed: `useMemo(() => createStyles(theme), [theme])` in `SectionHeader`.

- [x] ~~**`createItemStyles` called per list item per render**~~ — fixed: `useMemo` in `CheckoutItemRow`.

- [x] ~~**Cart state not cleared after sign-out**~~ — fixed: `clearCart()` now called in `signout.tsx` alongside `clearSession()` and `resetAccount()`.

### Medium
- ~~**Vault sub-screen re-export crashes**~~ — not a bug. `VaultHomeScreen.tsx` correctly exports all named components (`VaultFoldersScreen`, `VaultRecordScreen`, `VaultSharedScreen`, `VaultMoreScreen`). Route files wired correctly.

- ~~**`hybrid/studio.tsx` missing**~~ — not a bug. File exists; `HybridMoreScreen` and `HybridPublishScreen` also confirmed in `HybridDashboardScreen.tsx`.

- **`cart.hooks.ts` — validation races** — `useCartValidation` runs per-item Firestore reads
  on every cart open. No debounce or batching. With a large cart this fires N parallel reads.

### Low
- **`tmp/` folder is committed** — contains build artifacts and binary `.hbc` files.
  Add `tmp/` to `.gitignore`.

---

## Design Improvements (No Core Concept Changes)

- **Home screen sections show same data** — "Featured Picks", "Latest Releases", and "Free
  Music" all slice from the same 24 listings query. Featured = first 3, Releases = first 6,
  Free = filtered first 6. A user sees the same track appearing in two or three sections.
  Deduplicate: Featured picks first 3, Latest Releases skips those 3, Popular skips all used.

- **Empty cart CTA says "Browse Explore"** but the tab is labeled "Explore" in the nav config
  and "Marketplace" in the route. Pick one label and use it everywhere.

- **`InterimFeatureSheet`** is used 10+ times across screens as a coming-soon notice.
  Consider a `ComingSoonBadge` component on locked features instead of a full bottom sheet —
  less disruptive for features that are clearly staged (analytics, promote, recording).

- **Player surface mismatch handling is silent** — when `hasSurfaceMismatch` is true,
  `stop()` is called with no feedback to the user. A brief toast ("Switched to Vault — player
  stopped") would prevent confusion.

- **Role selection after login goes to `/`** then redirects. If `isAuthenticated` is already
  true, this double-redirect is visible on slower devices. Route directly to `/(tabs)` from
  `RoleSelectionScreen` after setting the role.

---

## Performance Optimizations

| Item | Location | Impact |
|---|---|---|
| ~~Standardize `limitCount` across marketplace callers~~ | done | — |
| ~~Extract shared Firestore mappers~~ | done (`marketplace`, `vault`) | remaining: `admin`, `account`, `studio`, `chat`, `downloads` |
| ~~Memoize `createStyles` calls in list item components~~ | done | — |
| Add `staleTime` to marketplace queries | `marketplace.hooks.ts` | Prevents refetch on every tab switch (currently 0ms stale) |
| Batch cart validation reads | `cart.hooks.ts` | Replace N parallel reads with a single `getDoc` batch |
| `GlobalPlayerHost` player effect deps | `GlobalPlayerHost.tsx:114` | The `status.*` dependencies cause the effect to re-run on every 250ms tick — split into separate focused effects |

---

## What to Tackle Next (Post-MVP)

1. **Full-text search** — Firestore does not support prefix/substring search. Wire Algolia
   or the Firebase Search Extension. The filter UI (`ExploreFeed`) is already built;
   it just needs a real query behind it instead of client-side array filter.

2. **Real-time messaging** — `chat.api.ts` uses `getDocs` (one-shot). Swap inbox and thread
   reads to `onSnapshot` listeners. The UI is already built.

3. **Push notifications** — No notification layer exists. Add Expo Notifications with a
   Firebase Cloud Messaging backend for: new message, sale, payout, content takedown.

4. **Studio analytics** — `StudioStreamsGraph` and the analytics screen are stubs. Wire to
   aggregated listen-count reads from Firestore (or a Cloud Function that aggregates daily).

5. **Vault recording** — `vault/record.tsx` is a stub. Needs `expo-av` recording session,
   waveform preview, and save-to-vault write.

6. **Promote flow** — `studio/promote.tsx` and `hybrid/vault/promote/[id].tsx` exist but the
   promotion write just sets `lifecycleStatus: 'promoted'`. Define what promotion means
   product-side (featured placement? paid boost?) before building the UI.

7. **Saved / likes persistence** — `SavedScreen` notes this is not live. Needs a
   `users/{uid}/saved` Firestore subcollection and a toggle in `ListingDetailsScreen`.

8. **Subscription payment** — `SubscriptionsScreen` has `InterimFeatureSheet` for all plan
   upgrades. Once Stripe is integrated for track purchases, reuse the same provider for
   recurring subscription payments.

---

## Firestore Collections Reference

| Collection | Purpose | Schema status |
|---|---|---|
| `users/{uid}` | User profile, role, usage | Inconsistent field names |
| `users/{uid}/uploads` | User's published listings | Inconsistent (see MVP #1) |
| `users/{uid}/vaultProjects` | Private vault files | Inconsistent (see MVP #1) |
| `users/{uid}/purchases` | Paid + free entitlements | Consistent — use as canonical |
| `uploads` (top-level) | Some listings stored here | Needs migration to user-scoped |
| `sellers/{uid}` | Seller profile fallback | Redundant with `users/{uid}` |

---

*Update this doc after each work session. Cross off completed items, add new findings.*
