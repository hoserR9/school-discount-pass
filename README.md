# Del Norte Nighthawk Discount Card — Apple Wallet

Digital version of the Del Norte High School Football discount card that lives in Apple Wallet. Each card has a unique ID and QR code linking the physical and digital versions. Features scan tracking, fraud prevention, push promotions, sponsor dashboards, and an admin panel.

## How It Works

### For Fans
1. **Buy a physical card** ($20) at a game or event — each card has a unique QR code
2. **Scan the QR code** with your iPhone camera → opens the claim page
3. **Tap "Add to Apple Wallet"** → the digital card is linked to your physical card
4. **At a business**, show the card (physical or digital) or have the cashier scan the QR code
5. The cashier verifies the card and applies the discount — no promo codes, you must have the card

### For Businesses
1. Customer presents the Nighthawk card (physical card or digital on their phone)
2. Cashier scans the QR code → sees a verification screen showing VALID + holder name
3. Or cashier visually confirms the card on the customer's phone
4. The scan is logged — the business can view their own analytics on the sponsor dashboard

### For Admins
1. Issue cards via the web page (`/pass`) or pre-generate batches (`node generate-batch.js --count 200`)
2. Monitor all card activity, scans, and sponsor usage at `/admin`
3. Push promotions to every cardholder's phone (game day deals, flash sales, new sponsors)
4. Deactivate lost/stolen cards instantly

## Quick Start

```bash
npm install
npm start
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Card distribution page |
| http://localhost:3000/admin | Admin dashboard |
| http://localhost:3000/sponsor | Sponsor login portal |
| http://localhost:3000/terms | Terms & Conditions, Privacy Policy, Sponsor Agreement |
| http://localhost:3000/pass | Generate a new digital pass |
| http://localhost:3000/card/:cardId | Smart endpoint — claim page (mobile) or verification (POS) |

## Batch Card Generation (for physical cards)

Pre-generate cards with unique QR codes for printing:

```bash
node generate-batch.js --count 200
node generate-batch.js --count 200 --base-url https://yourserver.com
```

Output in `output/batch-YYYY-MM-DD/`:
- `qr-codes/` — individual QR code PNGs (import into Canva)
- `card-backs/` — print-ready card backs with QR already embedded
- `manifest.csv` — full card list with serial numbers

Cards start as "unclaimed" in the database. When someone scans the QR, they claim it and add it to Apple Wallet.

## Sponsor Setup

Generate access codes for all participating businesses:

```bash
node seed-sponsors.js
```

Each business gets a unique access code to log in at `/sponsor` and view their own analytics (total visits, unique customers, visits by day, recent scans).

## Project Structure

```
school-discount-pass/
├── server.js                         # Express server (all endpoints)
├── src/
│   ├── generate-pass.js              # Apple Wallet pass generation
│   ├── database.js                   # SQLite database (cards, scans, registrations, promotions, sponsors)
│   └── push-update.js                # APNs push notification module
├── generate-batch.js                 # Batch card generator (QR codes + print-ready backs)
├── seed-sponsors.js                  # Generate sponsor access codes
├── models/
│   └── discount-card.pass/           # Apple Wallet pass template
│       ├── pass.json                 # Pass fields, colors, branding
│       ├── icon.png / icon@2x.png    # DN Nighthawk logo (notification icon)
│       ├── logo.png / logo@2x.png    # DN Nighthawk logo (pass header)
│       └── strip.png / strip@2x.png  # Banner image
├── public/
│   ├── index.html                    # Card distribution page
│   ├── admin.html                    # Admin dashboard (cards, scans, promotions)
│   ├── sponsor.html                  # Sponsor login portal (per-business analytics)
│   └── terms.html                    # Terms & Conditions, Privacy Policy, Sponsor Agreement
├── design/
│   ├── DNFOOTBALL_LOGO.png           # Official DN interlock logo
│   ├── card-front.png                # Physical card front render
│   ├── card-back.png                 # Physical card back render (with sponsor logos)
│   ├── card-front.svg / card-back.svg # SVG source files for Canva import
│   └── sponsor-logos/                # All 11 sponsor business logos
├── pitch/
│   ├── Del-Norte-Nighthawk-Sponsor-Pitch.pptx  # Sponsor marketing deck (13 slides)
│   ├── Del-Norte-Board-Approval.pptx            # Board approval deck (6 slides)
│   ├── sponsor-deck-content.md       # Sponsor deck content source
│   ├── board-deck-content.md         # Board deck content source
│   └── images/                       # Mockup images (wallet pass, scan verification, etc.)
├── certs/                            # Signing certificates (placeholder — see setup below)
├── DelNorteFootball.xcworkspace/     # Xcode workspace
├── DelNorteFootballApp.xcodeproj/    # Xcode project for iOS app
├── DelNorteFootballApp/              # SwiftUI iOS app source
└── data/                             # SQLite database (created at runtime, gitignored)
```

## Fraud Prevention

The system detects and flags suspicious card usage:

- **Unique Card IDs** — each card has a cryptographically generated ID. Screenshots show a static image, not a live pass.
- **Holder Name Verification** — the verification screen shows the cardholder's name in large text. Cashiers can ask "Are you John?" to confirm.
- **Rate Limiting** — cards scanned 5+ times in 24 hours are flagged with a yellow warning.
- **Rapid Scan Detection** — if the same card was scanned minutes ago at a different business, the cashier sees a warning with the location and time.
- **Instant Deactivation** — admins can deactivate any card immediately from the dashboard. The card turns red on the next scan.

No promo codes are used — you must have the physical or digital card to receive the discount.

## Redemption Methods

| Customer has | How the discount works |
|---|---|
| Digital card (Apple Wallet) | Show the card on phone, or cashier scans the QR code |
| Physical card | Show the card, or cashier scans the QR code printed on the back |
| Both | Either works — both are linked to the same Card ID |

## Push Promotions

Push updates to every cardholder's Apple Wallet at any time:

- **New business added** — update the participating businesses list
- **Flash deals** — "This weekend only: 20% off at Board & Brew"
- **Game day promos** — "Show your card at the snack bar tonight for a free drink"
- **Expiration reminders** — "Your card expires in 30 days"

### How it works

1. When a pass is added to Wallet, Apple registers the device with your server
2. You create a promotion in the admin dashboard (`/admin`)
3. Click "Push Update to All Devices"
4. Your server sends a push notification via APNs
5. Every iPhone fetches the updated pass (with the new promotion baked in)
6. Cardholder sees a lock-screen notification and their card refreshes

### APNs setup (required for push)

1. In your Apple Developer account, go to **Keys**
2. Click **+**, enable **Apple Push Notifications service (APNs)**
3. Download the `.p8` key file
4. Note the **Key ID**

```bash
APNS_KEY_PATH=./certs/apns-key.p8
APNS_KEY_ID=YOUR_KEY_ID
APNS_TEAM_ID=YOUR_TEAM_ID
APNS_USE_SANDBOX=true        # set to false for production
```

## Xcode Setup

1. Open `DelNorteFootball.xcworkspace` in Xcode
2. In the sidebar: SwiftUI app, server code, pass model, and web files
3. Select the `DelNorteFootballApp` scheme and a simulator, then Build & Run
4. The app needs the Node.js server running (`npm start`) to generate passes

## Apple Developer Setup (Required for Real Passes)

The project ships with self-signed placeholder certificates. To make real passes that work on iPhones:

### Step 1: Enroll in the Apple Developer Program
- Go to https://developer.apple.com/programs/enroll/
- Enroll as Individual or Organization ($99/year)

### Step 2: Create a Pass Type ID
1. **Certificates, Identifiers & Profiles** → **Identifiers** → **+**
2. Select **Pass Type IDs** → Continue
3. Description: `Del Norte Nighthawk Discount Card`
4. Identifier: `pass.com.delnorte.football.discount`

### Step 3: Create a Pass Signing Certificate
1. **Certificates** → **+** → **Pass Type ID Certificate**
2. Select the Pass Type ID from Step 2
3. Create a CSR in Keychain Access, upload it, download the `.cer`

### Step 4: Export as PEM
```bash
openssl x509 -inform DER -in pass.cer -out certs/signerCert.pem
openssl pkcs12 -in Certificates.p12 -nocerts -out certs/signerKey.pem -nodes
curl -o certs/wwdr.pem https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer
openssl x509 -inform DER -in certs/wwdr.pem -out certs/wwdr.pem
```

### Step 5: Update Configuration
1. In `pass.json`, change `"teamIdentifier": "PLACEHOLDER"` to your Team ID
2. In Xcode, set your Development Team in Signing & Capabilities

## API Endpoints

### Card Generation & Claiming
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/pass` | Generate a new digital pass |
| `GET` | `/pass?name=John` | Generate pass with holder name |
| `GET` | `/card/:cardId` | Smart endpoint: claim page (mobile) or verification (POS) |
| `GET` | `/card/:cardId/claim` | Download `.pkpass` for a specific card |
| `GET` | `/scan/:cardId` | Legacy scan verification endpoint |

### Apple Wallet Web Service (called by Apple automatically)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/devices/:deviceId/registrations/:passTypeId/:serial` | Register device for push updates |
| `GET` | `/v1/devices/:deviceId/registrations/:passTypeId` | List passes on device |
| `DELETE` | `/v1/devices/:deviceId/registrations/:passTypeId/:serial` | Unregister device |
| `GET` | `/v1/passes/:passTypeId/:serial` | Serve updated pass |
| `POST` | `/v1/log` | Receive Apple Wallet error logs |

### Admin, Promotions & Sponsors
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin` | Admin dashboard |
| `GET` | `/sponsor` | Sponsor login portal |
| `GET` | `/terms` | Terms & Conditions, Privacy Policy, Sponsor Agreement |
| `GET` | `/api/cards` | JSON list of all cards |
| `GET` | `/api/stats` | Usage statistics (cards, scans, devices, claims) |
| `POST` | `/api/cards/:id/deactivate` | Deactivate a card |
| `GET` | `/api/promotions` | List all promotions |
| `POST` | `/api/promotions` | Create a promotion `{title, message, activeUntil?}` |
| `POST` | `/api/promotions/:id/deactivate` | End a promotion |
| `POST` | `/api/push` | Push update to all registered devices |
| `POST` | `/api/sponsor/login` | Sponsor login `{code}` → returns analytics |

## Participating Businesses (2026-2027)

| Business | Discount |
|----------|----------|
| Baskin Robbins | BOGO 50% off scoops |
| Harland Brewing | 10% off |
| Board & Brew | 10% off |
| L&L Hawaiian Barbecue | 10% off |
| Kahoots | 20% off treats & bones |
| Mostra Coffee | 10% off |
| Rosinas | 10% off |
| Donut Touch | 10% off |
| Sushi Ren | 20% off, dine-in/carry out |
| Flippin Pizza | $5 off orders over $15, 1 per customer |
| Round Table Pizza (Rancho Bernardo) | 10% off |

## Legal Documents

Available at `/terms`:
- **Terms & Conditions** — non-transferable, non-refundable, fraud policy, liability
- **Privacy Policy** — data collection, CCPA compliance, children's privacy, retention
- **Sponsor Agreement** — discount obligations, data access limits, promotion rules

## Production Deployment

1. Set `BASE_URL` to your server URL (goes in the QR codes):
   ```bash
   BASE_URL=https://nighthawk-card.yourdomain.com npm start
   ```
2. Set `PORT` if needed (defaults to 3000)
3. Update `serverURL` in `DelNorteFootballApp/PassManager.swift`
4. Add authentication to `/admin` route
5. Back up `data/cards.db` regularly
6. Run `node seed-sponsors.js` to generate sponsor access codes

## Pitch Decks

| Deck | Slides | File |
|------|--------|------|
| Sponsor marketing pitch | 13 | `pitch/Del-Norte-Nighthawk-Sponsor-Pitch.pptx` |
| Board approval | 6 | `pitch/Del-Norte-Board-Approval.pptx` |

Both include card renders, Wallet pass mockups, scan verification screens, sponsor dashboard mockups, and the official DN Nighthawk logo.

## Tech Stack

- **Backend**: Node.js, Express, passkit-generator, better-sqlite3, qrcode, hapns
- **iOS App**: SwiftUI, PassKit framework
- **Pass Format**: Apple Wallet PKPass (Generic type)
- **Database**: SQLite (zero-config, file-based)
- **Push**: Apple Push Notification service via hapns
