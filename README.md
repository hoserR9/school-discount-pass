# Del Norte Nighthawk Discount Card — Apple Wallet

Digital version of the Del Norte High School Football discount card that lives in Apple Wallet. Features QR code verification, scan tracking, push updates for promotions, and an admin dashboard.

## How It Works

1. **Card holder** visits the web page or opens the iOS app and taps "Add to Apple Wallet"
2. A unique discount card (`.pkpass`) is generated with its own Card ID, QR code, and auth token
3. **Apple Wallet registers** the device with your server for push updates
4. **At a business**, the card holder shows the pass — the cashier scans the QR code
5. Scanning opens a verification page showing the card status (Valid / Expired / Deactivated)
6. Every scan is logged — the admin dashboard shows which businesses are getting traffic
7. **Push promotions** — create a promotion in the admin dashboard, push to all devices, and every cardholder's pass updates automatically with a lock-screen notification

## Quick Start

```bash
npm install
npm start
```

- **Card page**: http://localhost:3000
- **Admin dashboard**: http://localhost:3000/admin
- **Download a pass**: http://localhost:3000/pass
- **Download with holder name**: http://localhost:3000/pass?name=John+Doe

## Project Structure

```
school-discount-pass/
├── server.js                         # Express server (pass generation, scan tracking, admin API)
├── src/
│   ├── generate-pass.js              # Apple Wallet pass generation using passkit-generator
│   └── database.js                   # SQLite database for card tracking
├── models/
│   └── discount-card.pass/           # Apple Wallet pass template
│       ├── pass.json                 # Pass fields, colors, branding
│       ├── icon.png / icon@2x.png    # App icon (replace with school logo)
│       ├── logo.png / logo@2x.png    # Header logo (replace with school logo)
│       └── strip.png / strip@2x.png  # Banner image (replace with school branding)
├── public/
│   ├── index.html                    # Card distribution page
│   └── admin.html                    # Admin dashboard
├── certs/                            # Signing certificates (placeholder — see setup below)
│   ├── signerCert.pem
│   ├── signerKey.pem
│   └── wwdr.pem
├── DelNorteFootball.xcworkspace/     # Xcode workspace (opens everything in Xcode)
├── DelNorteFootballApp.xcodeproj/    # Xcode project for the iOS app
├── DelNorteFootballApp/              # SwiftUI iOS app source
│   ├── DelNorteFootballApp.swift     # App entry point
│   ├── ContentView.swift             # Main UI (card preview + Add to Wallet)
│   ├── PassManager.swift             # Fetches pass from server, adds to Wallet
│   ├── Info.plist                    # App config (allows local networking)
│   └── Assets.xcassets/              # App icon, colors
└── data/                             # SQLite database (created at runtime, gitignored)
```

## Xcode Setup

1. Open `DelNorteFootball.xcworkspace` in Xcode
2. In the sidebar you'll see:
   - **DelNorteFootballApp** — the SwiftUI iOS app
   - **Server** — `server.js`, `generate-pass.js`, `package.json`
   - **Pass Model** — `pass.json` (edit pass fields directly in Xcode)
   - **Web** — `index.html` landing page
3. Select the `DelNorteFootballApp` scheme and a simulator, then Build & Run
4. The app needs the Node.js server running (`npm start`) to generate passes

## Apple Developer Setup (Required for Real Passes)

The project ships with self-signed placeholder certificates. Passes generated with these **will show up as invalid** on a real iPhone. To make real passes:

### Step 1: Enroll in the Apple Developer Program

- Go to https://developer.apple.com/programs/enroll/
- Enroll as Individual or Organization ($99/year)
- Approval takes 24-48 hours

### Step 2: Create a Pass Type ID

1. Go to **Certificates, Identifiers & Profiles** in your Apple Developer account
2. Click **Identifiers** in the sidebar
3. Click the **+** button
4. Select **Pass Type IDs** and click Continue
5. Enter description: `Del Norte Nighthawk Discount Card`
6. Enter identifier: `pass.com.delnorte.football.discount`
7. Click Register

### Step 3: Create a Pass Signing Certificate

1. Go to **Certificates** in the sidebar
2. Click the **+** button
3. Under Services, select **Pass Type ID Certificate**
4. Click Continue and select the Pass Type ID from Step 2
5. Follow the prompts to create a Certificate Signing Request (CSR) using Keychain Access:
   - Open Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority
   - Enter your email, select "Saved to disk", click Continue
6. Upload the CSR file and download the `.cer` certificate
7. Double-click the `.cer` to install it in Keychain Access

### Step 4: Export Certificates as PEM Files

```bash
# Export from Keychain Access as .p12 (right-click > Export)
# Then convert to PEM:

# Signer certificate
openssl x509 -inform DER -in pass.cer -out certs/signerCert.pem

# Signer key (from the .p12 export)
openssl pkcs12 -in Certificates.p12 -nocerts -out certs/signerKey.pem -nodes

# Download Apple WWDR certificate
curl -o certs/wwdr.pem https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer
openssl x509 -inform DER -in certs/wwdr.pem -out certs/wwdr.pem
```

### Step 5: Update Configuration

1. In `models/discount-card.pass/pass.json`, change `"teamIdentifier": "PLACEHOLDER"` to your actual Team ID (found in your Apple Developer account under Membership)
2. In `DelNorteFootballApp.xcodeproj`, set your Development Team in Signing & Capabilities

## Replacing Placeholder Images

The pass template images are currently solid gold rectangles. Replace them with your actual Nighthawk logo:

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 29x29 | Notification icon |
| `icon@2x.png` | 58x58 | Notification icon (Retina) |
| `icon@3x.png` | 87x87 | Notification icon (3x) |
| `logo.png` | 160x50 | Top-left header logo on the pass |
| `logo@2x.png` | 320x100 | Header logo (Retina) |
| `strip.png` | 375x123 | Banner image behind primary fields |
| `strip@2x.png` | 750x246 | Banner image (Retina) |

All images go in `models/discount-card.pass/`.

## Admin Dashboard

Visit `/admin` to see:

- **Cards Issued** — total number of passes generated
- **Active Cards** — cards that haven't been deactivated
- **Total Scans** — how many times QR codes have been scanned
- **Usage by Business** — breakdown of scans per business with unique card counts
- **Card List** — every card with holder name, issue date, scan count, and a deactivate button

## Push Updates & Promotions

You can push updates to every cardholder's Apple Wallet at any time. Use cases:

- **New business added** — update the participating businesses list
- **Flash deals** — "This weekend only: 20% off at Board & Brew"
- **Game day promos** — "Show your card at the snack bar tonight for a free drink"
- **Seasonal specials** — holiday promotions from participating businesses
- **Expiration reminders** — "Your card expires in 30 days"

### How push updates work

1. When a pass is added to Wallet, Apple registers the device with your server
2. You create a promotion in the admin dashboard (`/admin`)
3. Click "Push Update to All Devices"
4. Your server sends a push notification via APNs (Apple Push Notification service)
5. Apple tells each iPhone "this pass has an update"
6. Each iPhone fetches the updated pass from your server (with the new promotion baked in)
7. The cardholder sees a lock-screen notification and their card refreshes

### APNs setup (required for push)

Push updates require an APNs authentication key:

1. In your Apple Developer account, go to **Keys**
2. Click **+**, enable **Apple Push Notifications service (APNs)**
3. Download the `.p8` key file
4. Note the **Key ID** shown after creation

Then set these environment variables:

```bash
APNS_KEY_PATH=./certs/apns-key.p8
APNS_KEY_ID=YOUR_KEY_ID
APNS_TEAM_ID=YOUR_TEAM_ID
APNS_USE_SANDBOX=true        # set to false for production
```

## API Endpoints

### Pass Generation & Scanning
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/pass` | Generate and download a new `.pkpass` file |
| `GET` | `/pass?name=John` | Generate pass with holder name |
| `GET` | `/scan/:cardId` | QR scan verification (shows card status, logs scan) |
| `GET` | `/scan/:cardId?biz=BoardAndBrew` | QR scan with business name tracking |

### Apple Wallet Web Service (called by Apple automatically)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/devices/:deviceId/registrations/:passTypeId/:serial` | Register device for push updates |
| `GET` | `/v1/devices/:deviceId/registrations/:passTypeId` | List passes on device |
| `DELETE` | `/v1/devices/:deviceId/registrations/:passTypeId/:serial` | Unregister device |
| `GET` | `/v1/passes/:passTypeId/:serial` | Serve updated pass to device |
| `POST` | `/v1/log` | Receive error logs from Apple Wallet |

### Admin & Promotions
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin` | Admin dashboard |
| `GET` | `/api/cards` | JSON list of all cards |
| `GET` | `/api/stats` | JSON usage statistics (includes registered device count) |
| `POST` | `/api/cards/:id/deactivate` | Deactivate a card |
| `GET` | `/api/promotions` | List all promotions |
| `POST` | `/api/promotions` | Create a promotion `{title, message, activeUntil?}` |
| `POST` | `/api/promotions/:id/deactivate` | End a promotion |
| `POST` | `/api/push` | Push update to all registered devices |

## Participating Businesses (2026-2027)

- Baskin Robbins — BOGO 50% off scoops
- Harland Brewing — 10% off
- Board & Brew — 10% off
- L&L Hawaiian Barbecue — 10% off
- Kahoots — 20% off treats & bones
- Mostra Coffee — 10% off
- Rosinas — 10% off
- Donut Touch — 10% off
- Sushi Ren — 20% off, dine-in/carry out
- Flippin Pizza — $5 off orders over $15, 1 per customer
- Round Table Pizza (Rancho Bernardo) — 10% off

## Production Deployment

When deploying to a real server:

1. Set the `BASE_URL` environment variable to your server URL (this is what goes in the QR code):
   ```bash
   BASE_URL=https://nighthawk-card.yourdomain.com npm start
   ```
2. Set `PORT` if needed (defaults to 3000)
3. Update `serverURL` in `DelNorteFootballApp/PassManager.swift` to your production URL
4. Consider adding authentication to the `/admin` route
5. Back up the `data/cards.db` SQLite file regularly

## Tech Stack

- **Backend**: Node.js, Express, passkit-generator, better-sqlite3
- **iOS App**: SwiftUI, PassKit framework
- **Pass Format**: Apple Wallet PKPass (Generic type)
- **Database**: SQLite (zero-config, file-based)
