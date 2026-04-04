/**
 * Generate 4 additional PowerPoint decks:
 * 1. Security (for sponsors/board)
 * 2. POS Compatibility (for sponsors)
 * 3. GitHub Developer Flow (for the team)
 * 4. Engineer Onboarding (for new devs)
 */
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const {
  FaShieldAlt, FaLock, FaUserCheck, FaDatabase, FaKey, FaCheckCircle,
  FaMobileAlt, FaQrcode, FaBarcode, FaWifi, FaHandshake,
  FaGithub, FaCodeBranch, FaCheckSquare, FaUserFriends,
  FaRocket, FaBook, FaCode, FaBug, FaFootballBall,
} = require("react-icons/fa");

const NAVY = "002D62";
const GOLD = "C5A55A";
const DARK_NAVY = "001A3A";
const WHITE = "FFFFFF";
const OFF_WHITE = "F5F0E6";
const LIGHT_GRAY = "A0A0A0";
const LIGHT_GOLD = "D4B96A";

const EXPORTS_DIR = path.resolve(__dirname, "../design/canva-exports");

function renderIconSvg(Icon, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(Icon, { color, size: String(size) }));
}
async function iconPng(Icon, color, size = 256) {
  const svg = renderIconSvg(Icon, color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
async function imgToBase64(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buf = fs.readFileSync(filePath);
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `${mime};base64,` + buf.toString("base64");
}
const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.2 });

// ══════════════════════════════════════════════════════════════
// DECK 1: SECURITY
// ══════════════════════════════════════════════════════════════
async function buildSecurityDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Nighthawk Card — Security & Privacy";

  const dnLogo = await imgToBase64(path.join(EXPORTS_DIR, "08-dn-nighthawk-logo-transparent.png"));
  const icons = {
    shield: await iconPng(FaShieldAlt, `#${GOLD}`),
    lock: await iconPng(FaLock, `#${GOLD}`),
    user: await iconPng(FaUserCheck, `#${GOLD}`),
    db: await iconPng(FaDatabase, `#${GOLD}`),
    key: await iconPng(FaKey, `#${GOLD}`),
    check: await iconPng(FaCheckCircle, `#${GOLD}`),
    navyShield: await iconPng(FaShieldAlt, `#${NAVY}`),
    navyLock: await iconPng(FaLock, `#${NAVY}`),
    navyUser: await iconPng(FaUserCheck, `#${NAVY}`),
  };

  // Slide 1: Title
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: dnLogo, x: 7.5, y: 0.3, w: 2.2, h: 1.3, sizing: { type: "contain", w: 2.2, h: 1.3 } });
    s.addImage({ data: icons.shield, x: 0.8, y: 1.0, w: 1.0, h: 1.0 });
    s.addText("SECURITY & PRIVACY", { x: 0.8, y: 2.2, w: 8, h: 0.8, fontSize: 40, fontFace: "Arial Black", bold: true, color: WHITE, margin: 0 });
    s.addText("Nighthawk Discount Card", { x: 0.8, y: 3.0, w: 8, h: 0.5, fontSize: 20, fontFace: "Arial", color: GOLD, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.6, w: 2.5, h: 0.04, fill: { color: GOLD } });
    s.addText("How we protect cardholders, sponsors, and data.", { x: 0.8, y: 3.9, w: 8, h: 0.4, fontSize: 14, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // Slide 2: Card Security
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("CARD SECURITY", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const items = [
      { title: "Unique Cryptographic IDs", desc: "Every card has a one-of-a-kind 11-character ID generated using secure random bytes. Can't be guessed, copied, or faked." },
      { title: "64-Character Auth Tokens", desc: "Every digital card includes an authentication token that Apple Wallet uses to talk to our server. Never shown to anyone." },
      { title: "Anti-Screenshot Protection", desc: "Apple Wallet barcodes animate live — screenshots capture a static image. Verification screen shows cardholder name for identity check." },
      { title: "Anti-Sharing Rate Limiting", desc: "Cards scanned 5+ times in 24 hours are flagged with a yellow warning. Rapid scans at different locations trigger alerts." },
    ];
    items.forEach((item, i) => {
      const y = 1.3 + i * 0.95;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.8, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.8, fill: { color: GOLD } });
      s.addText(item.title, { x: 0.9, y, w: 3, h: 0.8, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0 });
      s.addText(item.desc, { x: 3.9, y, w: 5.3, h: 0.8, fontSize: 11, fontFace: "Arial", color: "555555", valign: "middle", margin: 0 });
    });
  }

  // Slide 3: Data We Collect (and Don't)
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("MINIMAL DATA COLLECTION", { x: 0.8, y: 0.4, w: 9, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // What we collect
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.3, w: 4.3, h: 3.9, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.3, w: 4.3, h: 0.06, fill: { color: "1a7a1a" } });
    s.addText("WHAT WE COLLECT", { x: 0.9, y: 1.45, w: 3.8, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: "4caf50", margin: 0 });
    const collected = [
      "Cardholder name (optional)",
      "Scan timestamps",
      "Business name at scan",
      "Device push token",
      "IP address (fraud detection only)",
    ];
    collected.forEach((item, i) => {
      s.addText("  " + item, { x: 0.9, y: 1.95 + i * 0.45, w: 3.8, h: 0.4, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
    });

    // What we don't
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.3, w: 4.3, h: 3.9, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.3, w: 4.3, h: 0.06, fill: { color: "cc0000" } });
    s.addText("WHAT WE DON'T", { x: 5.4, y: 1.45, w: 3.8, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: "f44336", margin: 0 });
    const notCollected = [
      "Email addresses",
      "Phone numbers",
      "Payment info",
      "GPS location",
      "Contacts or photos",
      "Browsing history",
      "Social media accounts",
    ];
    notCollected.forEach((item, i) => {
      s.addText("  " + item, { x: 5.4, y: 1.95 + i * 0.4, w: 3.8, h: 0.35, fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    });
  }

  // Slide 4: Encryption & Infrastructure
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("ENCRYPTION & INFRASTRUCTURE", { x: 0.8, y: 0.25, w: 8.4, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const items = [
      { icon: icons.navyLock, title: "HTTPS Everywhere", desc: "All communication uses TLS 1.3. Authentication tokens transmitted only over encrypted connections." },
      { icon: icons.navyShield, title: "RSA for NFC", desc: "NFC communication uses Apple's secure element with RSA encryption." },
      { icon: icons.navyUser, title: "Isolated Database", desc: "SQLite database is not publicly accessible. Only the server can read/write." },
      { icon: icons.navyShield, title: "SOC 2 Compliant Hosting", desc: "Runs on Railway.app with automatic SSL certificates and container isolation." },
    ];
    items.forEach((item, i) => {
      const y = 1.3 + i * 0.9;
      s.addImage({ data: item.icon, x: 0.8, y: y + 0.1, w: 0.5, h: 0.5 });
      s.addText(item.title, { x: 1.5, y: y, w: 8, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText(item.desc, { x: 1.5, y: y + 0.32, w: 8, h: 0.45, fontSize: 11, fontFace: "Arial", color: "555555", margin: 0 });
    });
  }

  // Slide 5: Sponsor Data Access
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("SPONSOR DATA ACCESS", { x: 0.8, y: 0.4, w: 9, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("Each sponsor sees only their own data. Never other sponsors' information.", { x: 0.8, y: 1.0, w: 8.4, h: 0.4, fontSize: 13, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });

    // Can see
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.6, w: 4.3, h: 3.6, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.6, w: 4.3, h: 0.06, fill: { color: "1a7a1a" } });
    s.addText("CAN SEE", { x: 0.9, y: 1.75, w: 3.8, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: "4caf50", margin: 0 });
    ["Total visits from cardholders", "Number of unique card IDs", "Visit dates and times", "Anonymized card IDs (DN-XXXXXXXX)", "Scan history (last 50)"].forEach((t, i) => {
      s.addText("  " + t, { x: 0.9, y: 2.25 + i * 0.4, w: 3.8, h: 0.35, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
    });

    // Cannot see
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.6, w: 4.3, h: 3.6, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.6, w: 4.3, h: 0.06, fill: { color: "cc0000" } });
    s.addText("CANNOT SEE", { x: 5.4, y: 1.75, w: 3.8, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: "f44336", margin: 0 });
    ["Other sponsors' data", "Cardholder names (shown as IDs)", "Cardholder contact info", "Scans at other businesses", "Admin controls"].forEach((t, i) => {
      s.addText("  " + t, { x: 5.4, y: 2.25 + i * 0.4, w: 3.8, h: 0.35, fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    });
  }

  // Slide 6: Compliance
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("COMPLIANCE", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const items = [
      { title: "CCPA (California Consumer Privacy Act)", desc: "Cardholders can request their data, request deletion, and we do not sell or share personal info for marketing." },
      { title: "Children's Privacy", desc: "Minimized data collection for minors — only optional name. No email or phone. Parents can request deletion." },
      { title: "Apple Wallet Guidelines", desc: "Passes signed with Apple-issued certificates. Follow Apple's programming guidelines and use official APNs channels." },
    ];
    items.forEach((item, i) => {
      const y = 1.5 + i * 1.2;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 1.0, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 1.0, fill: { color: GOLD } });
      s.addText(item.title, { x: 0.9, y: y + 0.1, w: 8.2, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText(item.desc, { x: 0.9, y: y + 0.45, w: 8.2, h: 0.5, fontSize: 11, fontFace: "Arial", color: "555555", margin: 0 });
    });
  }

  // Slide 7: Closing
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.shield, x: 4.5, y: 1.0, w: 1.0, h: 1.0 });
    s.addText("YOUR DATA IS SAFE", { x: 0.8, y: 2.4, w: 8.4, h: 0.6, fontSize: 32, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.2, w: 3.0, h: 0.04, fill: { color: GOLD } });
    s.addText("Minimal data, strong encryption, clear boundaries.\nBuilt to protect cardholders, sponsors, and the school.", { x: 0.8, y: 3.5, w: 8.4, h: 0.8, fontSize: 16, fontFace: "Arial", italic: true, color: WHITE, align: "center", margin: 0 });
    s.addText("Full security policy available at [yoururl]/terms", { x: 0.8, y: 4.8, w: 8.4, h: 0.3, fontSize: 11, fontFace: "Arial", color: LIGHT_GRAY, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  await pres.writeFile({ fileName: path.resolve(__dirname, "Del-Norte-Security.pptx") });
  console.log("  Security deck saved (7 slides)");
}

// ══════════════════════════════════════════════════════════════
// DECK 2: POS COMPATIBILITY
// ══════════════════════════════════════════════════════════════
async function buildPOSDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Nighthawk Card — POS Compatibility";

  const dnLogo = await imgToBase64(path.join(EXPORTS_DIR, "08-dn-nighthawk-logo-transparent.png"));
  const walletMockup = await imgToBase64(path.join(EXPORTS_DIR, "03-digital-wallet-card.png"));
  const qrCode = await imgToBase64(path.join(EXPORTS_DIR, "11-sample-qr-code.png"));
  const scanMockup = await imgToBase64(path.join(EXPORTS_DIR, "04-scan-verification-valid.png"));

  const icons = {
    mobile: await iconPng(FaMobileAlt, `#${GOLD}`),
    qr: await iconPng(FaQrcode, `#${GOLD}`),
    barcode: await iconPng(FaBarcode, `#${GOLD}`),
    wifi: await iconPng(FaWifi, `#${GOLD}`),
    handshake: await iconPng(FaHandshake, `#${GOLD}`),
    navyQr: await iconPng(FaQrcode, `#${NAVY}`),
    navyBarcode: await iconPng(FaBarcode, `#${NAVY}`),
    navyHandshake: await iconPng(FaHandshake, `#${NAVY}`),
  };

  // Slide 1: Title
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: dnLogo, x: 7.5, y: 0.3, w: 2.2, h: 1.3, sizing: { type: "contain", w: 2.2, h: 1.3 } });
    s.addImage({ data: icons.qr, x: 0.8, y: 1.0, w: 1.0, h: 1.0 });
    s.addText("WORKS WITH YOUR POS", { x: 0.8, y: 2.2, w: 8, h: 0.8, fontSize: 38, fontFace: "Arial Black", bold: true, color: WHITE, margin: 0 });
    s.addText("Nighthawk Discount Card", { x: 0.8, y: 3.0, w: 8, h: 0.5, fontSize: 20, fontFace: "Arial", color: GOLD, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.6, w: 2.5, h: 0.04, fill: { color: GOLD } });
    s.addText("8 supported POS systems. Every business welcome.", { x: 0.8, y: 3.9, w: 8, h: 0.4, fontSize: 14, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // Slide 2: The 3 Tiers
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("3 INTEGRATION TIERS", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const tiers = [
      { color: "1a7a1a", title: "Tier 1: Full API Integration", pos: "Toast · Square · Clover · Shopify", desc: "Discount auto-applies at POS when card is scanned. No manual entry." },
      { color: "cc8800", title: "Tier 2: Barcode Scan", pos: "Revel · Heartland · SpotOn", desc: "POS reads the barcode and applies the configured coupon automatically." },
      { color: "666666", title: "Tier 3: Manual Verification", pos: "Any POS · Cash register", desc: "Cashier scans QR or views card on phone. Green verification screen confirms." },
    ];
    tiers.forEach((tier, i) => {
      const y = 1.3 + i * 1.3;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 1.15, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.1, h: 1.15, fill: { color: tier.color } });
      s.addText(tier.title, { x: 0.9, y: y + 0.1, w: 8.2, h: 0.35, fontSize: 15, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText(tier.pos, { x: 0.9, y: y + 0.45, w: 8.2, h: 0.3, fontSize: 12, fontFace: "Arial", bold: true, italic: true, color: tier.color, margin: 0 });
      s.addText(tier.desc, { x: 0.9, y: y + 0.75, w: 8.2, h: 0.35, fontSize: 11, fontFace: "Arial", color: "555555", margin: 0 });
    });
  }

  // Slide 3: Tier 1 - Full API Details
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("TIER 1: FULL API INTEGRATION", { x: 0.8, y: 0.4, w: 9, h: 0.6, fontSize: 22, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("Discount applies automatically. Zero cashier action needed.", { x: 0.8, y: 1.0, w: 8.4, h: 0.4, fontSize: 13, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });

    const posSystems = [
      { name: "Toast", how: "QR scan → our server → promo code auto-applies to check", need: "Client ID, Client Secret, Restaurant GUID, promo code" },
      { name: "Square", how: "QR scan → customer identified → catalog discount applied", need: "Access Token, Location ID" },
      { name: "Clover", how: "QR scan → REST API applies discount to open order", need: "Merchant ID, API Access Token" },
      { name: "Shopify POS", how: "QR scan → discount code auto-entered via POS SDK", need: "Store domain, Admin API Access Token" },
    ];
    posSystems.forEach((pos, i) => {
      const y = 1.5 + i * 0.88;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.78, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.78, fill: { color: GOLD } });
      s.addText(pos.name, { x: 0.9, y: y + 0.05, w: 1.5, h: 0.3, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
      s.addText("HOW: " + pos.how, { x: 0.9, y: y + 0.3, w: 8.2, h: 0.22, fontSize: 10, fontFace: "Arial", color: WHITE, margin: 0 });
      s.addText("NEEDS: " + pos.need, { x: 0.9, y: y + 0.52, w: 8.2, h: 0.22, fontSize: 10, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });
    });
  }

  // Slide 4: Tier 2 - Barcode Scan
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("TIER 2: BARCODE SCAN", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 26, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    s.addText("POS scans the Code128 barcode on the card. Looks up coupon. Applies discount.", { x: 0.8, y: 1.15, w: 8.4, h: 0.4, fontSize: 13, fontFace: "Arial", italic: true, color: "666666", margin: 0 });

    const posSystems = [
      { name: "Revel", how: "Card ID barcode scanned as a coupon product → discount applied to order", need: "Revel API URL, API Key, API Secret" },
      { name: "Heartland", how: "Coupon code scanned via barcode or typed by cashier → discount applied", need: "Heartland API Key, Store ID" },
      { name: "SpotOn", how: "QR scan → discount pushed to location via API", need: "SpotOn API Key, Location ID" },
    ];
    posSystems.forEach((pos, i) => {
      const y = 1.7 + i * 1.0;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.85, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.85, fill: { color: GOLD } });
      s.addText(pos.name, { x: 0.9, y: y + 0.05, w: 1.5, h: 0.3, fontSize: 16, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText("HOW: " + pos.how, { x: 0.9, y: y + 0.35, w: 8.2, h: 0.22, fontSize: 10, fontFace: "Arial", color: "555555", margin: 0 });
      s.addText("NEEDS: " + pos.need, { x: 0.9, y: y + 0.58, w: 8.2, h: 0.22, fontSize: 10, fontFace: "Arial", italic: true, color: "888888", margin: 0 });
    });
  }

  // Slide 5: Tier 3 - Manual
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("TIER 3: MANUAL VERIFICATION", { x: 0.8, y: 0.4, w: 9, h: 0.6, fontSize: 22, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("Works with ANY POS or even cash registers. No tech setup required.", { x: 0.8, y: 1.0, w: 8.4, h: 0.4, fontSize: 13, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });

    // Show the scan verification mockup
    s.addImage({ data: scanMockup, x: 5.8, y: 1.5, w: 3.5, h: 3.75, sizing: { type: "contain", w: 3.5, h: 3.75 } });

    const steps = [
      "Customer presents the card (digital or physical)",
      "Cashier scans the QR code with any camera or scanner",
      "Green verification screen appears with cardholder name",
      "Cashier applies discount manually in their POS",
      "Scan is logged automatically for analytics",
    ];
    steps.forEach((step, i) => {
      const y = 1.7 + i * 0.6;
      s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.05, w: 0.45, h: 0.45, fill: { color: GOLD } });
      s.addText(String(i + 1), { x: 0.6, y: y + 0.05, w: 0.45, h: 0.45, fontSize: 14, fontFace: "Arial Black", bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
      s.addText(step, { x: 1.2, y: y, w: 4.4, h: 0.55, fontSize: 11, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0 });
    });
  }

  // Slide 6: Card Technology
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("CARD TECHNOLOGY", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const techs = [
      { icon: icons.navyQr, title: "QR Code (primary)", encodes: "URL: /card/DN-XXXXXXXX", compat: "Modern POS cameras, smartphones" },
      { icon: icons.navyBarcode, title: "Code128 Barcode (alternate)", encodes: "Card ID: DN-XXXXXXXX", compat: "Legacy POS barcode scanners" },
      { icon: icons.navyQr, title: "NFC (tap)", encodes: "Card ID: DN-XXXXXXXX", compat: "NFC-enabled payment terminals (iPhone 6s+)" },
      { icon: icons.navyHandshake, title: "Visual (show card)", encodes: "Gold Nighthawk card on phone", compat: "Any business, no tech needed" },
    ];
    techs.forEach((tech, i) => {
      const y = 1.3 + i * 0.95;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.85, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addImage({ data: tech.icon, x: 0.8, y: y + 0.22, w: 0.42, h: 0.42 });
      s.addText(tech.title, { x: 1.4, y: y + 0.05, w: 3.5, h: 0.35, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText("Encodes: " + tech.encodes, { x: 1.4, y: y + 0.37, w: 3.5, h: 0.3, fontSize: 10, fontFace: "Arial", color: "666666", margin: 0 });
      s.addText("Compatible with: " + tech.compat, { x: 5.0, y: y + 0.22, w: 4.2, h: 0.5, fontSize: 10, fontFace: "Arial", italic: true, color: "555555", valign: "middle", margin: 0 });
    });
  }

  // Slide 7: Business FAQ
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("BUSINESS FAQ", { x: 0.8, y: 0.4, w: 9, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const faqs = [
      { q: "Do I need to change my POS system?", a: "No. The card works with whatever you have." },
      { q: "Does this cost me anything?", a: "No POS integration cost. Sponsorship fee covers everything." },
      { q: "What if my POS has no QR scanner?", a: "Customer shows the card on phone. Cashier verifies visually." },
      { q: "Can I see how many customers used the card?", a: "Yes. Private sponsor dashboard with visits, unique customers, and dates." },
    ];
    faqs.forEach((faq, i) => {
      const y = 1.2 + i * 1.0;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.88, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.88, fill: { color: GOLD } });
      s.addText("Q: " + faq.q, { x: 0.9, y: y + 0.08, w: 8.2, h: 0.3, fontSize: 12, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
      s.addText("A: " + faq.a, { x: 0.9, y: y + 0.4, w: 8.2, h: 0.4, fontSize: 11, fontFace: "Arial", color: WHITE, margin: 0 });
    });
  }

  await pres.writeFile({ fileName: path.resolve(__dirname, "Del-Norte-POS-Compatibility.pptx") });
  console.log("  POS Compatibility deck saved (7 slides)");
}

// ══════════════════════════════════════════════════════════════
// DECK 3: GITHUB DEVELOPER FLOW
// ══════════════════════════════════════════════════════════════
async function buildGitHubFlowDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Nighthawk — GitHub Developer Flow";

  const dnLogo = await imgToBase64(path.join(EXPORTS_DIR, "08-dn-nighthawk-logo-transparent.png"));
  const icons = {
    github: await iconPng(FaGithub, `#${GOLD}`),
    branch: await iconPng(FaCodeBranch, `#${GOLD}`),
    check: await iconPng(FaCheckSquare, `#${GOLD}`),
    users: await iconPng(FaUserFriends, `#${GOLD}`),
    navyBranch: await iconPng(FaCodeBranch, `#${NAVY}`),
    navyCheck: await iconPng(FaCheckSquare, `#${NAVY}`),
  };

  // Slide 1: Title
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: dnLogo, x: 7.5, y: 0.3, w: 2.2, h: 1.3, sizing: { type: "contain", w: 2.2, h: 1.3 } });
    s.addImage({ data: icons.github, x: 0.8, y: 1.0, w: 1.0, h: 1.0 });
    s.addText("GITHUB WORKFLOW", { x: 0.8, y: 2.2, w: 8, h: 0.8, fontSize: 38, fontFace: "Arial Black", bold: true, color: WHITE, margin: 0 });
    s.addText("For the Nighthawk Card Team", { x: 0.8, y: 3.0, w: 8, h: 0.5, fontSize: 20, fontFace: "Arial", color: GOLD, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.6, w: 2.5, h: 0.04, fill: { color: GOLD } });
    s.addText("How we collaborate, review code, and ship safely.", { x: 0.8, y: 3.9, w: 8, h: 0.4, fontSize: 14, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // Slide 2: The Workflow Overview
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("THE WORKFLOW", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const steps = [
      { num: "1", title: "Pick a task", desc: "From GitHub Issues or docs/TASKS.md" },
      { num: "2", title: "Create a branch", desc: "git checkout -b feature/task-name" },
      { num: "3", title: "Make changes", desc: "Write code, commit as you go" },
      { num: "4", title: "Push branch", desc: "git push -u origin feature/task-name" },
      { num: "5", title: "Open Pull Request", desc: "Request review from teammate" },
      { num: "6", title: "Review & Merge", desc: "Reviewer approves, clicks Merge" },
    ];
    steps.forEach((step, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.6 + col * 3.1;
      const y = 1.4 + row * 1.9;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.9, h: 1.6, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.2, w: 0.6, h: 0.6, fill: { color: NAVY } });
      s.addText(step.num, { x: x + 0.2, y: y + 0.2, w: 0.6, h: 0.6, fontSize: 22, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", valign: "middle", margin: 0 });
      s.addText(step.title, { x: x + 0.9, y: y + 0.25, w: 1.9, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText(step.desc, { x: x + 0.2, y: y + 0.95, w: 2.5, h: 0.55, fontSize: 10, fontFace: "Arial", color: "555555", margin: 0 });
    });
  }

  // Slide 3: Branching Rules
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.branch, x: 0.8, y: 0.35, w: 0.5, h: 0.5 });
    s.addText("BRANCHING RULES", { x: 1.5, y: 0.35, w: 8, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Main branch - protected
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.1, w: 8.8, h: 1.3, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.1, w: 0.1, h: 1.3, fill: { color: "cc0000" } });
    s.addText("main (PROTECTED)", { x: 0.9, y: 1.2, w: 8.2, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: "f44336", margin: 0 });
    s.addText("Never push directly to main. Always go through a Pull Request.", { x: 0.9, y: 1.55, w: 8.2, h: 0.35, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
    s.addText("Branch protection requires: 1 approval + no direct pushes", { x: 0.9, y: 1.9, w: 8.2, h: 0.35, fontSize: 11, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });

    // Feature branches
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.6, w: 8.8, h: 2.5, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.6, w: 0.1, h: 2.5, fill: { color: "4caf50" } });
    s.addText("feature/* branches", { x: 0.9, y: 2.7, w: 8.2, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: "4caf50", margin: 0 });
    s.addText("Naming convention: feature/short-description (kebab-case)", { x: 0.9, y: 3.05, w: 8.2, h: 0.3, fontSize: 11, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });

    const examples = [
      "feature/add-jest-tests",
      "feature/admin-auth",
      "feature/toast-integration",
      "fix/broken-terms-route",
    ];
    examples.forEach((ex, i) => {
      s.addText("  • " + ex, { x: 0.9, y: 3.45 + i * 0.35, w: 8.2, h: 0.3, fontSize: 11, fontFace: "monospace", color: WHITE, margin: 0 });
    });
  }

  // Slide 4: Writing Good Commits
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("GOOD COMMITS", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Good examples
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.3, w: 8.8, h: 1.7, fill: { color: "F0F8F0" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.3, w: 0.07, h: 1.7, fill: { color: "1a7a1a" } });
    s.addText("GOOD", { x: 0.9, y: 1.4, w: 3, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: "1a7a1a", margin: 0 });
    ["Add Jest tests for database module", "Fix card ID generation race condition", "Update Sushi Ken to Sushi Ren across all files"].forEach((ex, i) => {
      s.addText("  " + ex, { x: 0.9, y: 1.8 + i * 0.35, w: 8.2, h: 0.3, fontSize: 12, fontFace: "monospace", color: "333333", margin: 0 });
    });

    // Bad examples
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 3.2, w: 8.8, h: 1.7, fill: { color: "FFF5F5" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 3.2, w: 0.07, h: 1.7, fill: { color: "cc0000" } });
    s.addText("BAD", { x: 0.9, y: 3.3, w: 3, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: "cc0000", margin: 0 });
    ["update stuff", "fix", "wip", "asdf"].forEach((ex, i) => {
      s.addText("  " + ex, { x: 0.9, y: 3.7 + i * 0.28, w: 8.2, h: 0.25, fontSize: 12, fontFace: "monospace", color: "666666", margin: 0 });
    });

    s.addText("Rule: First line ≤ 50 chars, clear and specific. Use imperative mood.", { x: 0.6, y: 5.1, w: 8.8, h: 0.3, fontSize: 11, fontFace: "Arial", italic: true, color: "888888", margin: 0 });
  }

  // Slide 5: Pull Request Process
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.check, x: 0.8, y: 0.35, w: 0.5, h: 0.5 });
    s.addText("PULL REQUEST PROCESS", { x: 1.5, y: 0.35, w: 8, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Author side
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.2, w: 4.3, h: 4.0, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.2, w: 4.3, h: 0.06, fill: { color: GOLD } });
    s.addText("AUTHOR (you)", { x: 0.9, y: 1.35, w: 3.8, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    ["1. Push your branch", "2. Open PR on GitHub", "3. Write clear title + description", "4. Link the issue (Closes #5)", "5. Request review", "6. Address feedback", "7. Merge when approved"].forEach((t, i) => {
      s.addText(t, { x: 0.9, y: 1.85 + i * 0.42, w: 3.8, h: 0.38, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
    });

    // Reviewer side
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.2, w: 4.3, h: 4.0, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.2, w: 4.3, h: 0.06, fill: { color: GOLD } });
    s.addText("REVIEWER (teammate)", { x: 5.4, y: 1.35, w: 3.8, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    ["1. Read the description", "2. Check the file changes", "3. Look for: secrets, bugs, scope", "4. Test locally if big change", "5. Comment with questions", "6. Approve or request changes", "7. Merge when ready"].forEach((t, i) => {
      s.addText(t, { x: 5.4, y: 1.85 + i * 0.42, w: 3.8, h: 0.38, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
    });
  }

  // Slide 6: Daily Flow
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("A DAY IN THE LIFE", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const flow = [
      { time: "Morning", action: "git checkout main && git pull", desc: "Get latest code" },
      { time: "Start task", action: "git checkout -b feature/my-task", desc: "New branch" },
      { time: "Coding", action: "Edit files, run npm start, test", desc: "Make changes" },
      { time: "Checkpoint", action: "git add . && git commit -m \"...\"", desc: "Save progress" },
      { time: "Done", action: "git push -u origin feature/my-task", desc: "Upload to GitHub" },
      { time: "GitHub", action: "Open PR, request review", desc: "Share for review" },
      { time: "Merged", action: "git checkout main && git pull", desc: "Back to start" },
    ];
    flow.forEach((step, i) => {
      const y = 1.3 + i * 0.58;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.48, fill: { color: i % 2 === 0 ? OFF_WHITE : WHITE } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.48, fill: { color: GOLD } });
      s.addText(step.time, { x: 0.9, y, w: 1.2, h: 0.48, fontSize: 11, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0 });
      s.addText(step.action, { x: 2.2, y, w: 4.5, h: 0.48, fontSize: 11, fontFace: "monospace", color: "333333", valign: "middle", margin: 0 });
      s.addText(step.desc, { x: 6.8, y, w: 2.4, h: 0.48, fontSize: 10, fontFace: "Arial", italic: true, color: "888888", valign: "middle", margin: 0 });
    });
  }

  // Slide 7: Rules to Live By
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("RULES TO LIVE BY", { x: 0.8, y: 0.35, w: 9, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const rules = [
      "Never push directly to main — always through PR",
      "Never commit secrets (API keys, passwords) — use env vars",
      "Keep PRs small and focused — one thing at a time",
      "Write clear commit messages — others have to read them",
      "Test locally before pushing — npm start should work",
      "Review PRs within 24 hours — don't block teammates",
      "Ask questions in PR comments — don't guess",
    ];
    rules.forEach((rule, i) => {
      const y = 1.1 + i * 0.6;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.5, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.5, fill: { color: GOLD } });
      s.addText(String(i + 1) + ". " + rule, { x: 0.9, y, w: 8.2, h: 0.5, fontSize: 13, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0 });
    });
  }

  await pres.writeFile({ fileName: path.resolve(__dirname, "Del-Norte-GitHub-Flow.pptx") });
  console.log("  GitHub Flow deck saved (7 slides)");
}

// ══════════════════════════════════════════════════════════════
// DECK 4: ENGINEER ONBOARDING
// ══════════════════════════════════════════════════════════════
async function buildOnboardingDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Nighthawk — Engineer Onboarding";

  const dnLogo = await imgToBase64(path.join(EXPORTS_DIR, "08-dn-nighthawk-logo-transparent.png"));
  const icons = {
    rocket: await iconPng(FaRocket, `#${GOLD}`),
    book: await iconPng(FaBook, `#${GOLD}`),
    code: await iconPng(FaCode, `#${GOLD}`),
    bug: await iconPng(FaBug, `#${GOLD}`),
    navyRocket: await iconPng(FaRocket, `#${NAVY}`),
    navyBook: await iconPng(FaBook, `#${NAVY}`),
    navyCode: await iconPng(FaCode, `#${NAVY}`),
    football: await iconPng(FaFootballBall, `#${WHITE}`),
  };

  // Slide 1: Title - Welcome
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: dnLogo, x: 7.5, y: 0.3, w: 2.2, h: 1.3, sizing: { type: "contain", w: 2.2, h: 1.3 } });
    s.addImage({ data: icons.rocket, x: 0.8, y: 1.0, w: 1.0, h: 1.0 });
    s.addText("WELCOME!", { x: 0.8, y: 2.2, w: 8, h: 0.8, fontSize: 44, fontFace: "Arial Black", bold: true, color: WHITE, margin: 0 });
    s.addText("Engineer Onboarding", { x: 0.8, y: 3.0, w: 8, h: 0.5, fontSize: 20, fontFace: "Arial", color: GOLD, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.6, w: 2.5, h: 0.04, fill: { color: GOLD } });
    s.addText("Del Norte Nighthawk Discount Card — Engineering Team", { x: 0.8, y: 3.9, w: 8, h: 0.4, fontSize: 14, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // Slide 2: What You're Joining
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WHAT YOU'RE JOINING", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    s.addText("A digital discount card system for Del Norte HS Football.", { x: 0.8, y: 1.3, w: 8.4, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
    s.addText("Students buy a physical card. Scan it → get a digital version in Apple Wallet. Show at 11 local businesses → get discounts. All scans tracked, all sponsors get analytics, promotions pushed to cardholders' phones.", { x: 0.8, y: 1.7, w: 8.4, h: 1.0, fontSize: 13, fontFace: "Arial", color: "555555", margin: 0 });

    // Stack
    s.addText("THE TECH STACK", { x: 0.8, y: 2.9, w: 8, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    const stack = [
      { label: "Backend", tech: "Node.js + Express" },
      { label: "Database", tech: "SQLite (better-sqlite3)" },
      { label: "Passes", tech: "passkit-generator + Apple Wallet" },
      { label: "Push", tech: "APNs (Apple Push Notifications) via hapns" },
      { label: "Host", tech: "Railway.app" },
      { label: "iOS", tech: "SwiftUI + PassKit framework" },
    ];
    stack.forEach((s2, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.8 + col * 4.3;
      const y = 3.4 + row * 0.55;
      s.addText(s2.label + ":", { x, y, w: 1.3, h: 0.3, fontSize: 12, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText(s2.tech, { x: x + 1.3, y, w: 3.0, h: 0.3, fontSize: 12, fontFace: "Arial", color: "555555", margin: 0 });
    });
  }

  // Slide 3: First Day Checklist
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.book, x: 0.8, y: 0.35, w: 0.5, h: 0.5 });
    s.addText("DAY 1 CHECKLIST", { x: 1.5, y: 0.35, w: 8, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const tasks = [
      { time: "30 min", task: "Accept GitHub collaborator invite", tip: "Check email" },
      { time: "20 min", task: "Read README.md and docs/CONTRIBUTING.md", tip: "Get the full picture" },
      { time: "15 min", task: "Install Node.js 18+ and clone the repo", tip: "brew install node" },
      { time: "10 min", task: "Run npm install && npm start", tip: "Open http://localhost:3000" },
      { time: "15 min", task: "Install Claude Code (optional but recommended)", tip: "claude.com/claude-code" },
      { time: "30 min", task: "Make a small PR (fix a typo in README)", tip: "Practice the workflow" },
    ];
    tasks.forEach((t, i) => {
      const y = 1.1 + i * 0.68;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.58, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.58, fill: { color: GOLD } });
      s.addText(t.time, { x: 0.9, y, w: 1.2, h: 0.58, fontSize: 11, fontFace: "Arial", bold: true, color: GOLD, valign: "middle", margin: 0 });
      s.addText(t.task, { x: 2.2, y, w: 4.5, h: 0.58, fontSize: 12, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0 });
      s.addText(t.tip, { x: 6.8, y, w: 2.4, h: 0.58, fontSize: 10, fontFace: "Arial", italic: true, color: LIGHT_GRAY, valign: "middle", margin: 0 });
    });
  }

  // Slide 4: Project Structure
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("PROJECT STRUCTURE", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const paths = [
      { path: "server.js", desc: "Main Express server — all API endpoints" },
      { path: "src/generate-pass.js", desc: "Apple Wallet pass generation" },
      { path: "src/database.js", desc: "SQLite layer — cards, scans, sponsors, POS config" },
      { path: "src/push-update.js", desc: "APNs push notifications" },
      { path: "src/integrations/", desc: "POS integrations (Toast, Square, Clover, etc.)" },
      { path: "public/", desc: "HTML pages (admin, sponsor, terms, landing)" },
      { path: "models/discount-card.pass/", desc: "Apple Wallet pass template" },
      { path: "docs/", desc: "All documentation" },
    ];
    paths.forEach((p, i) => {
      const y = 1.3 + i * 0.48;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.4, fill: { color: i % 2 === 0 ? OFF_WHITE : WHITE } });
      s.addText(p.path, { x: 0.9, y, w: 3.5, h: 0.4, fontSize: 12, fontFace: "monospace", bold: true, color: NAVY, valign: "middle", margin: 0 });
      s.addText(p.desc, { x: 4.5, y, w: 4.7, h: 0.4, fontSize: 11, fontFace: "Arial", color: "555555", valign: "middle", margin: 0 });
    });
  }

  // Slide 5: Common Tasks
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.code, x: 0.8, y: 0.35, w: 0.5, h: 0.5 });
    s.addText("COMMON TASKS", { x: 1.5, y: 0.35, w: 8, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const tasks = [
      { title: "Start the server", cmd: "npm start" },
      { title: "Generate a test pass", cmd: "curl -o test.pkpass http://localhost:3000/pass" },
      { title: "Generate batch cards", cmd: "node generate-batch.js --count 5" },
      { title: "Seed sponsors", cmd: "node seed-sponsors.js" },
      { title: "Query the database", cmd: "sqlite3 data/cards.db" },
      { title: "Rebuild slide decks", cmd: "node pitch/rebuild-decks.js" },
    ];
    tasks.forEach((t, i) => {
      const y = 1.1 + i * 0.68;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.58, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.58, fill: { color: GOLD } });
      s.addText(t.title, { x: 0.9, y, w: 3, h: 0.58, fontSize: 13, fontFace: "Arial", bold: true, color: GOLD, valign: "middle", margin: 0 });
      s.addText(t.cmd, { x: 3.9, y, w: 5.3, h: 0.58, fontSize: 12, fontFace: "monospace", color: WHITE, valign: "middle", margin: 0 });
    });
  }

  // Slide 6: Where to Find Things
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WHERE TO FIND THINGS", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const resources = [
      { label: "Task backlog", file: "docs/TASKS.md" },
      { label: "How to contribute", file: "docs/CONTRIBUTING.md" },
      { label: "Test plan", file: "docs/TESTING.md" },
      { label: "Security model", file: "docs/SECURITY.md" },
      { label: "POS integrations", file: "docs/POS-COMPATIBILITY.md" },
      { label: "Live server", file: "https://web-production-9f35d.up.railway.app" },
      { label: "Admin dashboard", file: "/admin" },
      { label: "Apple Developer portal", file: "https://developer.apple.com" },
    ];
    resources.forEach((r, i) => {
      const y = 1.3 + i * 0.48;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.4, fill: { color: i % 2 === 0 ? OFF_WHITE : WHITE } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.4, fill: { color: GOLD } });
      s.addText(r.label, { x: 0.9, y, w: 3, h: 0.4, fontSize: 12, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0 });
      s.addText(r.file, { x: 3.9, y, w: 5.3, h: 0.4, fontSize: 11, fontFace: "monospace", color: "555555", valign: "middle", margin: 0 });
    });
  }

  // Slide 7: First Week Goals
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("FIRST WEEK GOALS", { x: 0.8, y: 0.35, w: 9, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const goals = [
      { day: "Day 1", goal: "Environment set up, first PR merged" },
      { day: "Day 2", goal: "Read the code, understand pass generation flow" },
      { day: "Day 3", goal: "Pick a Priority 1 task from docs/TASKS.md" },
      { day: "Day 4", goal: "Open a draft PR with progress, get early feedback" },
      { day: "Day 5", goal: "Merge your first real feature" },
      { day: "Week retro", goal: "What you learned, what was confusing, what's next" },
    ];
    goals.forEach((g, i) => {
      const y = 1.1 + i * 0.65;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.55, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.OVAL, { x: 0.75, y: y + 0.05, w: 0.45, h: 0.45, fill: { color: GOLD } });
      s.addText(String(i + 1), { x: 0.75, y: y + 0.05, w: 0.45, h: 0.45, fontSize: 16, fontFace: "Arial Black", bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
      s.addText(g.day, { x: 1.4, y, w: 2.0, h: 0.55, fontSize: 13, fontFace: "Arial", bold: true, color: GOLD, valign: "middle", margin: 0 });
      s.addText(g.goal, { x: 3.5, y, w: 5.7, h: 0.55, fontSize: 12, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0 });
    });
  }

  // Slide 8: Tips for Success
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("TIPS FOR SUCCESS", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const tips = [
      { tip: "Ask questions early", desc: "Don't get stuck for hours. Ping your manager or open a draft PR with questions." },
      { tip: "Read existing code first", desc: "Patterns matter. Look at similar features before writing new ones." },
      { tip: "Keep PRs small", desc: "1 task = 1 PR. Easier to review, faster to merge." },
      { tip: "Use Claude Code", desc: "AI pair programming speeds up boilerplate and explains unfamiliar code." },
      { tip: "Test before you push", desc: "Run npm start. Click around. Make sure it works." },
      { tip: "Ship it", desc: "Don't chase perfect. Done and reviewable beats perfect and private." },
    ];
    tips.forEach((t, i) => {
      const y = 1.3 + i * 0.68;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.58, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.58, fill: { color: GOLD } });
      s.addText(t.tip, { x: 0.9, y, w: 2.5, h: 0.58, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0 });
      s.addText(t.desc, { x: 3.4, y, w: 5.8, h: 0.58, fontSize: 11, fontFace: "Arial", color: "555555", valign: "middle", margin: 0 });
    });
  }

  // Slide 9: Closing
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.football, x: 4.4, y: 1.0, w: 1.2, h: 1.2 });
    s.addText("LET'S BUILD SOMETHING", { x: 0.8, y: 2.4, w: 8.4, h: 0.6, fontSize: 32, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.2, w: 3.0, h: 0.04, fill: { color: GOLD } });
    s.addText("Real users. Real businesses. Real impact for the football program.\nYour code will be in hundreds of people's phones.", { x: 0.8, y: 3.5, w: 8.4, h: 0.8, fontSize: 16, fontFace: "Arial", italic: true, color: WHITE, align: "center", margin: 0 });
    s.addText("Questions? Open a GitHub Issue or message your manager.", { x: 0.8, y: 4.8, w: 8.4, h: 0.3, fontSize: 11, fontFace: "Arial", color: LIGHT_GRAY, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  await pres.writeFile({ fileName: path.resolve(__dirname, "Del-Norte-Engineer-Onboarding.pptx") });
  console.log("  Engineer Onboarding deck saved (9 slides)");
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
async function main() {
  console.log("Generating 4 additional decks...\n");
  await buildSecurityDeck();
  await buildPOSDeck();
  await buildGitHubFlowDeck();
  await buildOnboardingDeck();
  console.log("\nAll decks saved to pitch/ directory");
}

main().catch(console.error);
