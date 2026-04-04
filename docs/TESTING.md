# Del Norte Nighthawk Discount Card — Testing Documentation

## Overview

This document covers unit tests, integration tests, and the full end-to-end setup/flow test plan for the Nighthawk Discount Card system.

---

## 1. Unit Tests

### 1.1 Pass Generation (`src/generate-pass.js`)

| Test | Input | Expected Result |
|------|-------|-----------------|
| Generate pass with holder name | `generatePass({ holderName: 'John Doe' })` | Returns buffer (valid zip), cardId starts with "DN-", authToken is 64 chars |
| Generate pass without holder name | `generatePass()` | Returns buffer, holder is null in DB |
| Generate pass for existing card (update) | `generatePass({ existingCardId, existingSerialNumber, existingAuthToken })` | Reuses same card ID, does not create new DB record |
| Pass includes QR code | Generate pass, inspect buffer | QR barcode encodes `{BASE_URL}/card/{cardId}` |
| Pass includes Code128 barcode | Generate pass, inspect buffer | Code128 barcode encodes card ID |
| Pass includes NFC (when env set) | Set `NFC_PUBLIC_KEY`, generate pass | NFC field present with card ID message |
| Pass includes active promotions | Create promotion, then generate pass | Back fields include "CURRENT PROMOTIONS" section |

### 1.2 Database (`src/database.js`)

| Test | Action | Expected Result |
|------|--------|-----------------|
| Insert card | `insertCard.run(...)` | Card exists in `cards` table |
| Get card by ID | `getCard.get(cardId)` | Returns correct card object |
| Get card by serial | `getCardBySerial.get(serial)` | Returns correct card |
| Get card by auth token | `getCardByAuthToken.get(token)` | Returns correct card |
| Log scan | `logScan.run(cardId, 'Board & Brew', ip, ua)` | Scan exists in `scans` table |
| Get scans for card | `getScansForCard.all(cardId)` | Returns array sorted by scanned_at DESC |
| Deactivate card | `deactivateCard.run(cardId)` | Card `is_active` = 0 |
| Claim card | `claimCard.run('John', cardId)` | Card `is_claimed` = 1, `claimed_at` set, `holder_name` = 'John' |
| Register device | `registerDevice.run(deviceId, pushToken, serial, passTypeId)` | Registration exists |
| Unregister device | `unregisterDevice.run(...)` | Registration removed |
| Create promotion | `createPromotion.run(...)` | Promotion exists, active by default |
| Get active promotions | `getActivePromotions.all()` | Returns only active, non-expired promotions |
| Deactivate promotion | `deactivatePromotion.run(id)` | Promotion `is_active` = 0 |
| Create sponsor | `createSponsor.run(...)` | Sponsor exists with access code |
| Get sponsor by code | `getSponsorByCode.get(code)` | Returns correct sponsor |
| Upsert POS config | `upsertPosConfig.run(name, 'toast', '{}')` | Config exists, updates on duplicate |
| Claim stats | `getClaimStats.get()` | Returns total, claimed, unclaimed counts |

### 1.3 Fraud Detection (in `server.js` renderScanPage)

| Test | Scenario | Expected Result |
|------|----------|-----------------|
| Valid card, no flags | Card with 1 scan today | Green screen, "VALID" |
| Card scanned 5+ times in 24hrs | 5 scans within 24 hours | Yellow screen, "VALID — CHECK ID", warning message |
| Rapid scan | Same card scanned within 5 minutes at different business | Warning: "Just scanned Xmin ago at {business}" |
| Deactivated card | `is_active` = 0 | Red screen, "DEACTIVATED" |
| Expired card | `valid_thru` in the past | Red screen, "EXPIRED" |

### 1.4 POS Integrations (`src/integrations/`)

| Test | POS Type | Expected Result |
|------|----------|-----------------|
| Manual validation (valid) | `validateForPOS('manual', {}, cardId, name, true)` | `{ success: true, pos: 'manual' }` |
| Manual validation (invalid) | `validateForPOS('manual', {}, cardId, name, false)` | `{ success: false }` |
| Toast validation (no creds) | `validateForPOS('toast', { clientId: 'fake' }, ...)` | `{ success: false, fallback: 'Apply discount manually' }` |
| Square validation (no creds) | `validateForPOS('square', { accessToken: 'fake' }, ...)` | `{ success: false }` |
| All 8 POS types listed | `getSupportedPOSTypes()` | Returns array of 8 objects |
| Unknown POS type | `validateForPOS('unknown', ...)` | Falls through to manual |

### 1.5 Push Updates (`src/push-update.js`)

| Test | Scenario | Expected Result |
|------|----------|-----------------|
| No registered devices | `pushUpdateToAll()` | `{ sent: 0, message: 'No registered devices' }` |
| No APNs key configured | Devices registered but no key | `{ sent: 0, message: 'APNs not configured — push skipped' }` |
| APNs key configured | Real key + registered devices | `{ sent: N }` |

### 1.6 Batch Generation (`generate-batch.js`)

| Test | Input | Expected Result |
|------|-------|-----------------|
| Generate 5 cards | `node generate-batch.js --count 5` | 5 QR PNGs, 5 card back PNGs, manifest.csv with 5 rows, 5 cards in DB |
| Cards are unclaimed | After batch generation | All 5 cards have `is_claimed = 0` |
| QR codes are unique | Inspect manifest.csv | All card IDs are different |
| Custom base URL | `--base-url https://example.com` | QR URLs start with `https://example.com` |

---

## 2. API Endpoint Tests

### 2.1 Pass Generation

```bash
# Generate a new pass (download .pkpass file)
curl -o test.pkpass http://localhost:3000/pass
# Should return: application/vnd.apple.pkpass file

# Generate with holder name
curl -o test.pkpass "http://localhost:3000/pass?name=John+Doe"
```

### 2.2 Card Scan — Smart Endpoint

```bash
# Browser/mobile scan (returns HTML)
curl http://localhost:3000/card/DN-XXXXXXXX

# POS scan (returns JSON)
curl -H "Accept: application/json" http://localhost:3000/card/DN-XXXXXXXX

# POS scan with business name
curl -H "Accept: application/json" "http://localhost:3000/card/DN-XXXXXXXX?biz=Board+%26+Brew&format=json"
```

**Expected JSON response:**
```json
{
  "valid": true,
  "status": "valid",
  "cardId": "DN-XXXXXXXX",
  "holder": "John Doe",
  "validThru": "2027-07-31",
  "totalScans": 3,
  "scansToday": 1,
  "flagged": false,
  "lastScan": "2026-10-04 18:32:00"
}
```

### 2.3 Card Claim

```bash
# Claim a card (returns .pkpass)
curl -o claimed.pkpass "http://localhost:3000/card/DN-XXXXXXXX/claim?name=John+Doe"
```

### 2.4 Apple Wallet Web Service

```bash
# Register device
curl -X POST -H "Authorization: ApplePass {authToken}" \
  -H "Content-Type: application/json" \
  -d '{"pushToken":"fake-push-token"}' \
  http://localhost:3000/v1/devices/device123/registrations/pass.com.delnorte.football.discount/SERIAL

# List passes for device
curl http://localhost:3000/v1/devices/device123/registrations/pass.com.delnorte.football.discount

# Get updated pass
curl -H "Authorization: ApplePass {authToken}" \
  http://localhost:3000/v1/passes/pass.com.delnorte.football.discount/SERIAL

# Unregister device
curl -X DELETE -H "Authorization: ApplePass {authToken}" \
  http://localhost:3000/v1/devices/device123/registrations/pass.com.delnorte.football.discount/SERIAL
```

### 2.5 Admin API

```bash
# Stats
curl http://localhost:3000/api/stats

# All cards
curl http://localhost:3000/api/cards

# Deactivate card
curl -X POST http://localhost:3000/api/cards/DN-XXXXXXXX/deactivate

# Create promotion
curl -X POST -H "Content-Type: application/json" \
  -d '{"title":"Game Day","message":"20% off at Board & Brew tonight!"}' \
  http://localhost:3000/api/promotions

# List promotions
curl http://localhost:3000/api/promotions

# Push update to all devices
curl -X POST http://localhost:3000/api/push
```

### 2.6 Sponsor Portal

```bash
# Sponsor login
curl -X POST -H "Content-Type: application/json" \
  -d '{"code":"ABC123"}' \
  http://localhost:3000/api/sponsor/login
```

### 2.7 POS Config

```bash
# List supported POS types
curl http://localhost:3000/api/pos-types

# List all POS configs
curl http://localhost:3000/api/pos-config

# Set POS config for a business
curl -X POST -H "Content-Type: application/json" \
  -d '{"businessName":"Board & Brew","posType":"toast","config":{"clientId":"xxx","clientSecret":"xxx","restaurantGuid":"xxx","promoCode":"NIGHTHAWK"}}' \
  http://localhost:3000/api/pos-config
```

---

## 3. End-to-End Setup Flow Test Plan

This is the full test you run when deploying for the first time or after major changes.

### Phase 1: Server Setup

- [ ] `npm install` completes without errors
- [ ] `npm start` starts the server on port 3000
- [ ] Visit http://localhost:3000 — card distribution page loads
- [ ] Visit http://localhost:3000/admin — admin dashboard loads (empty)
- [ ] Visit http://localhost:3000/sponsor — sponsor login page loads
- [ ] Visit http://localhost:3000/terms — terms page loads with all 3 sections

### Phase 2: Card Generation

- [ ] Click "Add to Apple Wallet" on the card page — downloads a .pkpass file
- [ ] The .pkpass file is a valid zip (check first 2 bytes are PK)
- [ ] Open the .pkpass on a Mac — shows pass preview in Finder
- [ ] Admin dashboard now shows 1 card issued

### Phase 3: Batch Generation

- [ ] Run `node generate-batch.js --count 5`
- [ ] `output/batch-YYYY-MM-DD/qr-codes/` has 5 PNG files
- [ ] `output/batch-YYYY-MM-DD/card-backs/` has 5 PNG files
- [ ] `output/batch-YYYY-MM-DD/manifest.csv` has 5 rows + header
- [ ] Admin dashboard now shows 6 cards (1 from Phase 2 + 5 batch)
- [ ] All 5 batch cards show `is_claimed = 0` in the dashboard

### Phase 4: Card Claim Flow

- [ ] Open one of the batch card QR URLs in a mobile browser (e.g., `/card/DN-XXXXXXXX`)
- [ ] Claim page loads with Nighthawk branding
- [ ] Enter a name and tap "Add to Apple Wallet"
- [ ] .pkpass downloads
- [ ] Admin dashboard now shows that card as claimed

### Phase 5: Scan Verification

- [ ] Open a card URL on a desktop browser — shows green VALID page
- [ ] Card holder's name is displayed prominently
- [ ] Scan count increments
- [ ] Visit the same URL 5+ times — warning appears (yellow screen, "CHECK ID")
- [ ] Deactivate the card in admin dashboard
- [ ] Visit the URL again — red DEACTIVATED screen

### Phase 6: POS JSON API

- [ ] `curl -H "Accept: application/json" http://localhost:3000/card/DN-XXXXXXXX` returns JSON
- [ ] JSON includes: valid, status, cardId, holder, totalScans, scansToday, flagged
- [ ] Deactivated card returns `{ valid: false, status: "deactivated" }`
- [ ] Invalid card ID returns 404 with `{ valid: false, error: "Card not found" }`

### Phase 7: Promotions

- [ ] Create a promotion in admin dashboard
- [ ] Promotion appears in the promotions table
- [ ] Scan a card — promotion shows on the verification page
- [ ] Generate a new pass — promotion appears in back fields
- [ ] Deactivate the promotion — no longer shows on scans or new passes

### Phase 8: Sponsor Portal

- [ ] Run `node seed-sponsors.js` — prints access codes for all 11 businesses
- [ ] Visit `/sponsor` and enter one of the access codes
- [ ] Dashboard loads showing the business name, tier, and stats
- [ ] Stats are empty (no scans for that business yet)
- [ ] Scan a card with `?biz=Board%20%26%20Brew` — re-login as Board & Brew sponsor
- [ ] Stats now show 1 visit

### Phase 9: Push Updates (requires Apple certs)

- [ ] Add real Apple signing certificates to env vars
- [ ] Generate a pass and add it to a real iPhone
- [ ] Create a promotion in admin dashboard
- [ ] Click "Push Update to All Devices"
- [ ] iPhone receives a notification that the pass was updated
- [ ] Open the pass — new promotion appears on the back

### Phase 10: Railway Deployment

- [ ] Push to GitHub — Railway auto-deploys
- [ ] Visit `https://web-production-9f35d.up.railway.app` — card page loads
- [ ] `BASE_URL` env var is set in Railway
- [ ] Generate a pass via the Railway URL — QR code points to Railway URL (not localhost)
- [ ] All endpoints work on the deployed server

---

## 4. Regression Checklist

Run this after every code change:

- [ ] `npm start` — server starts without errors
- [ ] Pass generation — `curl -o test.pkpass http://localhost:3000/pass` returns valid file
- [ ] Card scan HTML — `/card/DN-XXXXXXXX` returns HTML in browser
- [ ] Card scan JSON — `/card/DN-XXXXXXXX?format=json` returns valid JSON
- [ ] Admin dashboard loads — `/admin` shows stats
- [ ] Sponsor portal loads — `/sponsor` shows login form
- [ ] Promotions API — create and list promotions
- [ ] Batch generation — `node generate-batch.js --count 2` succeeds
- [ ] POS types — `curl http://localhost:3000/api/pos-types` returns 8 types

---

## 5. Running Tests

### Quick smoke test (30 seconds)

```bash
npm start &
sleep 2
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000         # expect 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin    # expect 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/sponsor  # expect 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/terms    # expect 200
curl -s -o test.pkpass http://localhost:3000/pass                     # should download
curl -s http://localhost:3000/api/stats                               # should return JSON
curl -s http://localhost:3000/api/pos-types                           # should return 8 types
kill %1
echo "Smoke test complete"
```

### Full automated test (future)

A proper test suite using Jest or Mocha should be created to automate all unit tests above. This is a future task.
