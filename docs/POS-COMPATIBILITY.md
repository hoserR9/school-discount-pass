# Del Norte Nighthawk Discount Card — POS Compatibility Guide

## Supported POS Systems

The Nighthawk Discount Card works with **every POS system** — either through direct API integration, QR code scanning, barcode scanning, NFC tap, or manual verification.

---

## Integration Tiers

### Tier 1: Full API Integration
The discount is applied automatically when the card is scanned. No manual entry needed.

| POS System | How It Works | What the Business Provides |
|---|---|---|
| **Toast** | QR scan → our server validates → promo code auto-applies to the check | Toast API Client ID, Client Secret, Restaurant GUID, promo code name |
| **Square** | QR scan → our server validates → customer identified in Square, discount applied via Catalog API | Square Access Token, Location ID |
| **Clover** | QR scan → our server validates → discount applied via REST API to open order | Clover Merchant ID, API Access Token |
| **Shopify POS** | QR scan → discount code auto-entered via Shopify POS SDK | Shopify store domain, Admin API Access Token |

### Tier 2: Barcode/QR Scan Integration
The POS reads the card's barcode and the cashier confirms the discount.

| POS System | How It Works | What the Business Provides |
|---|---|---|
| **Revel** | Card ID barcode scanned as a coupon product → discount applied to order | Revel API URL, API Key, API Secret |
| **Heartland** | Coupon code scanned via barcode or typed by cashier → discount applied | Heartland API Key, Store ID |
| **SpotOn** | QR scan → discount pushed to location via API | SpotOn API Key, Location ID |

### Tier 3: Manual Verification
The cashier scans the QR code (or looks at the card) and applies the discount manually. Works with any POS.

| POS System | How It Works |
|---|---|
| **Any POS** | Customer shows the card → cashier scans QR → green VALID screen appears → cashier applies discount |
| **No POS / cash register** | Customer shows the card on their phone → cashier visually confirms → applies discount |

---

## Card Technology

Each Nighthawk card includes multiple technologies so it works with any scanner:

| Technology | What It Encodes | Compatible With |
|---|---|---|
| **QR Code** (primary) | URL: `https://yourserver.com/card/DN-XXXXXXXX` | Modern POS with camera scanner, smartphones |
| **Code128 Barcode** (alternate) | Card ID: `DN-XXXXXXXX` | Legacy POS barcode scanners, retail scanners |
| **NFC** (tap) | Card ID: `DN-XXXXXXXX` | NFC-enabled payment terminals (iPhone 6s+) |
| **Visual** (show card) | Gold Nighthawk card on phone screen | Any business, no tech needed |

---

## What the Business Sees When a Card Is Scanned

### QR Scan (Browser)
The cashier's screen shows a **green verification page**:
- Large checkmark
- "DEL NORTE NIGHTHAWK — VALID"
- Cardholder's name (large, for identity verification)
- Card ID, valid thru date
- Total scans, scans today
- Active promotions (if any)

### QR Scan (POS with API)
The POS receives **structured JSON data**:
```json
{
  "valid": true,
  "status": "valid",
  "cardId": "DN-8F3A2B1C",
  "holder": "John Doe",
  "totalScans": 7,
  "scansToday": 1,
  "flagged": false
}
```

### Fraud Warnings
If the card is flagged for suspicious activity, the screen turns **yellow** with warnings:
- "Used 6 times in 24hrs — possible sharing"
- "Just scanned 3min ago at Sushi Ren"
- Cashier is prompted to verify the customer's identity

---

## Setup Per Business

### For Tier 1 (Full API) Businesses:
1. Business provides their POS API credentials
2. Admin configures the business in the dashboard (`/admin` → POS Integrations)
3. We create the "Nighthawk Discount" in their POS system
4. Test with a sample card scan
5. Go live — discounts apply automatically

### For Tier 2 (Barcode Scan) Businesses:
1. Business configures the discount/coupon code in their POS
2. The Nighthawk card's Code128 barcode encodes the card ID
3. Cashier scans the barcode → POS looks up the coupon → discount applies

### For Tier 3 (Manual) Businesses:
1. No setup needed
2. Train cashier: "When you see the Nighthawk card (gold card on phone or physical card), apply the agreed discount"
3. Optionally scan QR code for verification and tracking

---

## Business FAQ

**Q: Do I need to change my POS system?**
A: No. The Nighthawk card works with whatever you have. If you have Toast, Square, or Clover, we can integrate directly. Otherwise, the cashier just scans or looks at the card.

**Q: Does this cost me anything?**
A: No POS integration cost. The sponsorship fee covers everything. We set it up for you.

**Q: What if my POS doesn't have a QR scanner?**
A: The customer shows the card on their phone. Your cashier visually confirms and applies the discount — same as the old physical card.

**Q: What about NFC?**
A: If your payment terminal supports NFC (most modern ones do), the customer can tap their phone. This is a future feature that will be activated when ready.

**Q: Can I see how many customers used the card?**
A: Yes. You get a private login to your own sponsor dashboard showing total visits, unique customers, visits by day, and recent scan history.

**Q: What happens if someone shares a screenshot?**
A: Screenshots don't have live QR codes. When scanned, the verification screen shows the cardholder's name — cashiers can ask "Are you John?" Also, cards scanned too many times get flagged automatically.
