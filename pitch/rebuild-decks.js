/**
 * Rebuild both PowerPoint decks with mockup images and card renders embedded.
 * This adds visual slides showing the actual product to both decks.
 */
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { FaMobileAlt, FaQrcode, FaBullhorn, FaChartBar, FaHandshake, FaRocket, FaStar, FaUsers, FaPhoneAlt, FaFootballBall, FaTrophy, FaBell, FaShieldAlt, FaDollarSign, FaUserCheck } = require("react-icons/fa");

const NAVY = "002D62";
const GOLD = "C5A55A";
const DARK_NAVY = "001A3A";
const LIGHT_GOLD = "D4B96A";
const WHITE = "FFFFFF";
const OFF_WHITE = "F5F0E6";
const LIGHT_GRAY = "A0A0A0";

const EXPORTS_DIR = path.resolve(__dirname, "../design/canva-exports");
const DESIGN_DIR = path.resolve(__dirname, "../design");

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

async function buildSponsorDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Del Norte HS Football";
  pres.title = "Nighthawk Digital Discount Card — Sponsor Pitch";

  const icons = {
    football: await iconPng(FaFootballBall, `#${WHITE}`),
    bell: await iconPng(FaBell, `#${WHITE}`),
    navyMobile: await iconPng(FaMobileAlt, `#${NAVY}`),
    navyQr: await iconPng(FaQrcode, `#${NAVY}`),
    navyBullhorn: await iconPng(FaBullhorn, `#${NAVY}`),
    navyChart: await iconPng(FaChartBar, `#${NAVY}`),
    navyHandshake: await iconPng(FaHandshake, `#${NAVY}`),
  };

  const cardFront = await imgToBase64(path.join(EXPORTS_DIR, "01-physical-card-front.png"));
  const cardBack = await imgToBase64(path.join(EXPORTS_DIR, "02-physical-card-back.png"));
  const walletMockup = await imgToBase64(path.join(EXPORTS_DIR, "03-digital-wallet-card.png"));
  const scanMockup = await imgToBase64(path.join(EXPORTS_DIR, "04-scan-verification-valid.png"));
  const sponsorDash = await imgToBase64(path.join(EXPORTS_DIR, "07-sponsor-dashboard.png"));
  const claimMockup = await imgToBase64(path.join(EXPORTS_DIR, "06-claim-page-mobile.png"));
  const qrCode = await imgToBase64(path.join(EXPORTS_DIR, "11-sample-qr-code.png"));
  const dnLogo = await imgToBase64(path.join(EXPORTS_DIR, "08-dn-nighthawk-logo-transparent.png"));

  // ═══════ SLIDE 1: TITLE ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    // Nighthawk logo top right
    s.addImage({ data: dnLogo, x: 7.5, y: 0.3, w: 2.2, h: 1.3, sizing: { type: "contain", w: 2.2, h: 1.3 } });
    s.addText("DEL NORTE", { x: 0.8, y: 1.0, w: 8, h: 0.8, fontSize: 20, fontFace: "Arial", color: GOLD, charSpacing: 8, margin: 0 });
    s.addText("NIGHTHAWK", { x: 0.8, y: 1.6, w: 8, h: 1.0, fontSize: 44, fontFace: "Arial Black", bold: true, color: WHITE, margin: 0 });
    s.addText("Digital Discount Card", { x: 0.8, y: 2.5, w: 8, h: 0.6, fontSize: 24, fontFace: "Arial", color: GOLD, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.4, w: 2.5, h: 0.04, fill: { color: GOLD } });
    s.addText("Del Norte High School Football — 2026-2027 Season", { x: 0.8, y: 3.7, w: 8, h: 0.5, fontSize: 14, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    s.addText([
      { text: '"', options: { fontSize: 28, color: GOLD } },
      { text: "Your business in every fan's pocket", options: { fontSize: 18, italic: true, color: WHITE } },
      { text: '"', options: { fontSize: 28, color: GOLD } },
    ], { x: 0.8, y: 4.3, w: 8, h: 0.7, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // ═══════ SLIDE 2: THE CARD — physical + digital side by side ═══════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("THE NIGHTHAWK DISCOUNT CARD", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Physical card front
    s.addText("Physical Card", { x: 0.5, y: 1.2, w: 4, h: 0.4, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, align: "center", margin: 0 });
    s.addImage({ data: cardFront, x: 0.8, y: 1.6, w: 3.8, h: 2.17, sizing: { type: "contain", w: 3.8, h: 2.17 } });

    // Arrow
    s.addText(">>>", { x: 4.3, y: 2.5, w: 1.4, h: 0.5, fontSize: 24, fontFace: "Arial", color: GOLD, align: "center", valign: "middle", margin: 0 });

    // Digital wallet pass
    s.addText("Apple Wallet", { x: 5.5, y: 1.2, w: 4, h: 0.4, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, align: "center", margin: 0 });
    s.addImage({ data: walletMockup, x: 6.2, y: 1.5, w: 2.3, h: 3.56, sizing: { type: "contain", w: 2.3, h: 3.56 } });

    s.addText("Every person gets a physical card with a unique QR code. Scan it to add to Apple Wallet.", { x: 0.8, y: 5.0, w: 8.4, h: 0.4, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
  }

  // ═══════ SLIDE 3: HOW IT WORKS — CUSTOMER (with claim page mockup) ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("HOW IT WORKS — FOR THE CUSTOMER", { x: 0.8, y: 0.4, w: 9, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const steps = [
      { num: "1", text: 'Scan the QR code on their physical card' },
      { num: "2", text: 'Enter their name and tap "Add to Apple Wallet"' },
      { num: "3", text: 'Show the card at participating businesses' },
      { num: "4", text: 'Discount applied — simple, fast, no paper' },
    ];
    steps.forEach((st, i) => {
      const y = 1.2 + i * 0.85;
      s.addShape(pres.shapes.OVAL, { x: 0.8, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: GOLD } });
      s.addText(st.num, { x: 0.8, y: y + 0.05, w: 0.5, h: 0.5, fontSize: 18, fontFace: "Arial Black", bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
      s.addText(st.text, { x: 1.6, y: y, w: 4.2, h: 0.6, fontSize: 14, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0 });
    });

    // Claim page mockup on right
    s.addImage({ data: claimMockup, x: 6.5, y: 0.8, w: 2.8, h: 3.85, sizing: { type: "contain", w: 2.8, h: 3.85 } });
  }

  // ═══════ SLIDE 4: HOW IT WORKS — SPONSOR (with scan verification) ═══════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("HOW IT WORKS — FOR YOU", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const items = [
      { icon: icons.navyMobile, text: "Your business listed on every digital card" },
      { icon: icons.navyQr, text: "Customer scans QR → you see this verification screen" },
      { icon: icons.navyChart, text: "Every visit tracked — you get usage reports" },
      { icon: icons.navyHandshake, text: "Integrates with your POS (Toast, Square, Clover, and more)" },
    ];
    items.forEach((item, i) => {
      const y = 1.3 + i * 0.85;
      s.addImage({ data: item.icon, x: 0.8, y: y + 0.1, w: 0.45, h: 0.45 });
      s.addText(item.text, { x: 1.5, y: y, w: 4.3, h: 0.65, fontSize: 14, fontFace: "Arial", color: "333333", valign: "middle", margin: 0 });
    });

    // Scan verification mockup on right
    s.addImage({ data: scanMockup, x: 6.2, y: 1.1, w: 2.8, h: 3.64, sizing: { type: "contain", w: 2.8, h: 3.64 } });
  }

  // ═══════ SLIDE 5: CARD BACK — sponsor listing ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("YOUR BUSINESS ON EVERY CARD", { x: 0.8, y: 0.4, w: 9, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Card back image — large, centered
    s.addImage({ data: cardBack, x: 1.0, y: 1.2, w: 8.0, h: 4.0, sizing: { type: "contain", w: 8.0, h: 4.0 } });
    s.addText("Every physical card has a unique QR code on the back. Scan it to load the digital version into Apple Wallet.", { x: 0.8, y: 5.0, w: 8.4, h: 0.4, fontSize: 12, fontFace: "Arial", bold: true, color: LIGHT_GOLD, margin: 0 });
  }

  // ═══════ SLIDE 6: WHY DIGITAL BEATS PHYSICAL ═══════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WHY DIGITAL BEATS PHYSICAL", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const comparisons = [
      ["Gets lost, forgotten at home", "Always in their phone"],
      ["No way to track usage", "Every scan is tracked"],
      ["Static once printed", "Push new deals anytime"],
      ["One-time impression", "Ongoing notifications"],
      ["Printing costs", "Zero printing costs"],
    ];

    // Headers
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 4.0, h: 0.5, fill: { color: "E8E0E0" } });
    s.addText("Physical Card", { x: 0.8, y: 1.3, w: 4.0, h: 0.5, fontSize: 14, fontFace: "Arial", bold: true, color: "999999", align: "center", valign: "middle", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.3, w: 4.0, h: 0.5, fill: { color: GOLD } });
    s.addText("Digital Card", { x: 5.2, y: 1.3, w: 4.0, h: 0.5, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });

    comparisons.forEach((row, i) => {
      const y = 1.9 + i * 0.6;
      const bg = i % 2 === 0 ? "F8F6F2" : "FFFFFF";
      s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 4.0, h: 0.55, fill: { color: bg } });
      s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y, w: 4.0, h: 0.55, fill: { color: bg } });
      s.addText(row[0], { x: 1.0, y, w: 3.6, h: 0.55, fontSize: 12, fontFace: "Arial", color: "999999", valign: "middle", margin: 0 });
      s.addText(row[1], { x: 5.4, y, w: 3.6, h: 0.55, fontSize: 12, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0 });
    });
  }

  // ═══════ SLIDE 7: PUSH PROMOTIONS ═══════
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };
    s.addImage({ data: icons.bell, x: 0.8, y: 0.4, w: 0.6, h: 0.6 });
    s.addText("PUSH PROMOTIONS", { x: 1.6, y: 0.4, w: 7, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("The Game Changer", { x: 1.6, y: 0.9, w: 7, h: 0.4, fontSize: 16, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });

    s.addText("Push limited-time promotions directly to every cardholder's phone.", { x: 0.8, y: 1.5, w: 8.4, h: 0.5, fontSize: 15, fontFace: "Arial", color: WHITE, margin: 0 });

    const promos = [
      "Game Day Special: 20% off at Board & Brew — tonight only!",
      "Homecoming Weekend: Buy one get one at Baskin Robbins",
      "End of Season: Double discount at all sponsors this week",
    ];
    promos.forEach((p, i) => {
      const y = 2.2 + i * 0.7;
      s.addShape(pres.shapes.RECTANGLE, { x: 1.2, y, w: 7.6, h: 0.55, fill: { color: DARK_NAVY }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 1.2, y, w: 0.07, h: 0.55, fill: { color: GOLD } });
      s.addText(p, { x: 1.6, y, w: 7.0, h: 0.55, fontSize: 13, fontFace: "Arial", italic: true, color: WHITE, valign: "middle", margin: 0 });
    });

    s.addText("Cardholders get a lock-screen notification and their card updates automatically.", { x: 0.8, y: 4.4, w: 8.4, h: 0.5, fontSize: 13, fontFace: "Arial", color: LIGHT_GOLD, margin: 0 });
  }

  // ═══════ SLIDE 8: WHAT SPONSORS GET ═══════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WHAT SPONSORS GET", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const benefits = [
      { icon: icons.navyMobile, title: "Brand Visibility", desc: "On every digital card — hundreds of fans" },
      { icon: icons.navyBullhorn, title: "Push Promotions", desc: "Featured deals pushed to every cardholder's phone" },
      { icon: icons.navyChart, title: "Usage Reports", desc: "See visits and unique customers on your own dashboard" },
      { icon: icons.navyHandshake, title: "Community Goodwill", desc: "Your business supports local student athletes" },
      { icon: icons.navyQr, title: "Zero Setup", desc: "No app, no POS integration, no tech hassle" },
    ];
    benefits.forEach((b, i) => {
      const y = 1.3 + i * 0.75;
      s.addImage({ data: b.icon, x: 0.8, y: y + 0.08, w: 0.4, h: 0.4 });
      s.addText(b.title, { x: 1.5, y: y, w: 3, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText(b.desc, { x: 1.5, y: y + 0.32, w: 7, h: 0.35, fontSize: 12, fontFace: "Arial", color: "666666", margin: 0 });
    });
  }

  // ═══════ SLIDE 9: WORKS WITH YOUR POS ═══════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WORKS WITH YOUR POS", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Tier 1
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.3, w: 8.8, h: 1.1, fill: { color: OFF_WHITE }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.3, w: 0.07, h: 1.1, fill: { color: GOLD } });
    s.addText("Full API Integration", { x: 0.9, y: 1.35, w: 3, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
    s.addText("Toast, Square, Clover, Shopify — discount applies automatically at the POS when the card is scanned. No manual entry.", { x: 0.9, y: 1.7, w: 8.2, h: 0.5, fontSize: 12, fontFace: "Arial", color: "555555", margin: 0 });

    // Tier 2
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.6, w: 8.8, h: 1.1, fill: { color: OFF_WHITE }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.6, w: 0.07, h: 1.1, fill: { color: GOLD } });
    s.addText("Barcode Scan Integration", { x: 0.9, y: 2.65, w: 3, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
    s.addText("Revel, Heartland, SpotOn — POS reads the barcode on the card and applies the configured coupon.", { x: 0.9, y: 3.0, w: 8.2, h: 0.5, fontSize: 12, fontFace: "Arial", color: "555555", margin: 0 });

    // Tier 3
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 3.9, w: 8.8, h: 1.1, fill: { color: OFF_WHITE }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 3.9, w: 0.07, h: 1.1, fill: { color: GOLD } });
    s.addText("Any Other POS", { x: 0.9, y: 3.95, w: 3, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
    s.addText("Cashier scans the QR code or views the card on the customer's phone. Verification screen confirms the card is valid.", { x: 0.9, y: 4.3, w: 8.2, h: 0.5, fontSize: 12, fontFace: "Arial", color: "555555", margin: 0 });

    s.addText("We configure everything for you. No tech changes needed at your business.", { x: 0.8, y: 5.1, w: 8.4, h: 0.35, fontSize: 12, fontFace: "Arial", bold: true, italic: true, color: NAVY, margin: 0 });
  }

  // ═══════ SLIDE 10: SECURE & PRIVATE ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("SECURE & PRIVATE", { x: 0.8, y: 0.35, w: 9, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const secItems = [
      { title: "Unique Cryptographic IDs", desc: "Every card has a one-of-a-kind ID that can't be guessed, copied, or faked" },
      { title: "Anti-Sharing Protection", desc: "Cards scanned too many times get flagged automatically with a warning" },
      { title: "Name Verification", desc: "Cashier sees the cardholder's name on the verification screen" },
      { title: "Your Data Is Yours", desc: "Sponsors only see their own analytics — never other sponsors' data" },
      { title: "No Personal Data Collected", desc: "No emails, phone numbers, or payment info — just an optional name" },
      { title: "Encrypted & Compliant", desc: "HTTPS everywhere, CCPA compliant, hosted on secure cloud infrastructure" },
    ];
    secItems.forEach((item, i) => {
      const y = 1.0 + i * 0.7;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.58, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.58, fill: { color: GOLD } });
      s.addText(item.title, { x: 0.9, y, w: 3, h: 0.58, fontSize: 12, fontFace: "Arial", bold: true, color: GOLD, valign: "middle", margin: 0 });
      s.addText(item.desc, { x: 3.9, y, w: 5.3, h: 0.58, fontSize: 11, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0 });
    });
  }

  // ═══════ SLIDE 11: YOUR OWN DASHBOARD (with mockup) ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("YOUR OWN DASHBOARD", { x: 0.8, y: 0.35, w: 9, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("Each sponsor gets a private login to view their analytics.", { x: 0.8, y: 0.85, w: 8, h: 0.3, fontSize: 13, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });

    // Sponsor dashboard mockup — large, centered
    s.addImage({ data: sponsorDash, x: 1.0, y: 1.4, w: 8.0, h: 3.8, sizing: { type: "contain", w: 8.0, h: 3.8 } });
  }

  // ═══════ SLIDE 10: CURRENT SPONSORS ═══════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("CURRENT SPONSORS (2026-2027)", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const sponsors = ["Baskin Robbins", "Harland Brewing", "Board & Brew", "L&L Hawaiian Barbecue", "Kahoots", "Mostra Coffee", "Rosinas", "Donut Touch", "Sushi Ren", "Flippin Pizza", "Round Table Pizza"];
    sponsors.forEach((sp, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 0.8 + col * 3.0, y = 1.4 + row * 0.9;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.7, h: 0.7, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 0.7, fill: { color: GOLD } });
      s.addText(sp, { x: x + 0.2, y, w: 2.3, h: 0.7, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0 });
    });
    s.addText("Join them and put your business in front of the entire Nighthawk community.", { x: 0.8, y: 5.0, w: 8.4, h: 0.4, fontSize: 13, fontFace: "Arial", italic: true, color: "888888", margin: 0 });
  }

  // ═══════ SLIDE 11: SPONSORSHIP TIERS ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("SPONSORSHIP TIERS", { x: 0.8, y: 0.3, w: 9, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const tiers = [
      { name: "GOLD", price: "$500", color: GOLD, textColor: NAVY, perks: ["Featured at top of card", "2 push promotions/month", "Monthly usage reports", "Logo on game day materials"] },
      { name: "SILVER", price: "$250", color: "C0C0C0", textColor: NAVY, perks: ["Listed on the card", "1 push promotion/month", "Quarterly usage reports"] },
      { name: "BRONZE", price: "$100", color: "CD7F32", textColor: WHITE, perks: ["Listed on the card", "Seasonal usage reports"] },
    ];
    tiers.forEach((tier, i) => {
      const x = 0.6 + i * 3.15, w = 2.9;
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.1, w, h: 4.2, fill: { color: "0A1A35" }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.1, w, h: 1.2, fill: { color: tier.color } });
      s.addText(tier.name, { x, y: 1.15, w, h: 0.6, fontSize: 20, fontFace: "Arial Black", bold: true, color: tier.textColor, align: "center", valign: "middle", margin: 0 });
      s.addText(tier.price, { x, y: 1.7, w, h: 0.55, fontSize: 32, fontFace: "Arial Black", bold: true, color: tier.textColor, align: "center", valign: "middle", margin: 0 });
      tier.perks.forEach((perk, j) => {
        s.addText(perk, { x: x + 0.3, y: 2.6 + j * 0.55, w: w - 0.6, h: 0.45, fontSize: 11, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0 });
      });
    });
  }

  // ═══════ SLIDE 12: HOW TO GET STARTED ═══════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("HOW TO GET STARTED", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const steps = ["Choose your sponsorship tier", "Tell us your discount offer", "We add your business to the card — live immediately", "Existing cardholders get a push notification", "Start seeing customers with the Nighthawk Card"];
    steps.forEach((step, i) => {
      const y = 1.5 + i * 0.7;
      s.addShape(pres.shapes.OVAL, { x: 1.0, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: NAVY } });
      s.addText(String(i + 1), { x: 1.0, y: y + 0.05, w: 0.5, h: 0.5, fontSize: 16, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", valign: "middle", margin: 0 });
      s.addText(step, { x: 1.8, y: y, w: 7.4, h: 0.6, fontSize: 15, fontFace: "Arial", color: "333333", valign: "middle", margin: 0 });
    });

    // QR code sample on right
    s.addImage({ data: qrCode, x: 7.5, y: 1.4, w: 1.8, h: 1.8 });
    s.addText("Sample QR Code", { x: 7.5, y: 3.2, w: 1.8, h: 0.3, fontSize: 9, fontFace: "Arial", color: "999999", align: "center", margin: 0 });
  }

  // ═══════ SLIDE 13: CONTACT ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: dnLogo, x: 3.5, y: 0.4, w: 3.0, h: 1.8, sizing: { type: "contain", w: 3.0, h: 1.8 } });
    s.addText("DEL NORTE HIGH SCHOOL FOOTBALL", { x: 0.8, y: 2.2, w: 8.4, h: 0.6, fontSize: 20, fontFace: "Arial Black", bold: true, color: WHITE, align: "center", margin: 0 });
    s.addText("Nighthawk Discount Card Program", { x: 0.8, y: 2.7, w: 8.4, h: 0.5, fontSize: 16, fontFace: "Arial", color: GOLD, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.4, w: 3.0, h: 0.04, fill: { color: GOLD } });
    s.addText([
      { text: '"', options: { fontSize: 28, color: GOLD } },
      { text: "Support student athletes. Drive customers to your door.", options: { fontSize: 18, italic: true, color: WHITE } },
      { text: '"', options: { fontSize: 28, color: GOLD } },
    ], { x: 0.8, y: 3.8, w: 8.4, h: 0.8, align: "center", margin: 0 });
    s.addText("All sponsorships subject to Terms & Conditions, Privacy Policy, and Sponsor Agreement.", { x: 0.8, y: 5.0, w: 8.4, h: 0.3, fontSize: 10, fontFace: "Arial", italic: true, color: LIGHT_GRAY, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  await pres.writeFile({ fileName: path.resolve(__dirname, "Del-Norte-Nighthawk-Sponsor-Pitch.pptx") });
  console.log("  Sponsor deck saved (15 slides)");
}

// ═══════════════════════════════════════════════
// BOARD APPROVAL DECK
// ═══════════════════════════════════════════════

async function buildBoardDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Del Norte HS Football";
  pres.title = "Nighthawk Digital Discount Card — Board Approval";

  const icons = {
    football: await iconPng(FaFootballBall, `#${WHITE}`),
    shield: await iconPng(FaShieldAlt, `#${GOLD}`),
    chart: await iconPng(FaChartBar, `#${GOLD}`),
    bullhorn: await iconPng(FaBullhorn, `#${GOLD}`),
    dollar: await iconPng(FaDollarSign, `#${GOLD}`),
  };

  const cardFront = await imgToBase64(path.join(EXPORTS_DIR, "01-physical-card-front.png"));
  const cardBack = await imgToBase64(path.join(EXPORTS_DIR, "02-physical-card-back.png"));
  const walletMockup = await imgToBase64(path.join(EXPORTS_DIR, "03-digital-wallet-card.png"));
  const scanMockup = await imgToBase64(path.join(EXPORTS_DIR, "04-scan-verification-valid.png"));
  const fraudMockup = await imgToBase64(path.join(EXPORTS_DIR, "05-fraud-warning-screen.png"));
  const sponsorDash = await imgToBase64(path.join(EXPORTS_DIR, "07-sponsor-dashboard.png"));
  const qrCode = await imgToBase64(path.join(EXPORTS_DIR, "11-sample-qr-code.png"));
  const dnLogo = await imgToBase64(path.join(EXPORTS_DIR, "08-dn-nighthawk-logo-transparent.png"));

  // ═══════ SLIDE 1: TITLE ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: dnLogo, x: 7.5, y: 0.3, w: 2.2, h: 1.3, sizing: { type: "contain", w: 2.2, h: 1.3 } });
    s.addText("MODERNIZING THE", { x: 0.8, y: 1.2, w: 8, h: 0.5, fontSize: 16, fontFace: "Arial", color: GOLD, charSpacing: 4, margin: 0 });
    s.addText("NIGHTHAWK\nDISCOUNT CARD", { x: 0.8, y: 1.7, w: 8, h: 1.6, fontSize: 42, fontFace: "Arial Black", bold: true, color: WHITE, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.5, w: 2.5, h: 0.04, fill: { color: GOLD } });
    s.addText("Del Norte High School Football\nBoard Review — 2026-2027 Season", { x: 0.8, y: 3.8, w: 8, h: 0.8, fontSize: 14, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // ═══════ SLIDE 2: WHAT IT LOOKS LIKE — cards + wallet ═══════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WHAT IT LOOKS LIKE", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Physical card
    s.addText("Physical Card (Front)", { x: 0.3, y: 1.2, w: 3.5, h: 0.3, fontSize: 10, fontFace: "Arial", bold: true, color: NAVY, align: "center", margin: 0 });
    s.addImage({ data: cardFront, x: 0.3, y: 1.5, w: 3.5, h: 2.0, sizing: { type: "contain", w: 3.5, h: 2.0 } });

    // Card back
    s.addText("Physical Card (Back) with Unique QR", { x: 0.3, y: 3.6, w: 3.5, h: 0.3, fontSize: 10, fontFace: "Arial", bold: true, color: NAVY, align: "center", margin: 0 });
    s.addImage({ data: cardBack, x: 0.3, y: 3.9, w: 3.5, h: 1.5, sizing: { type: "contain", w: 3.5, h: 1.5 } });

    // Wallet mockup
    s.addText("Apple Wallet Version", { x: 4.2, y: 1.2, w: 2.3, h: 0.3, fontSize: 10, fontFace: "Arial", bold: true, color: NAVY, align: "center", margin: 0 });
    s.addImage({ data: walletMockup, x: 4.2, y: 1.5, w: 2.3, h: 3.56, sizing: { type: "contain", w: 2.3, h: 3.56 } });

    // QR Code sample
    s.addText("Unique QR Code", { x: 7.2, y: 1.2, w: 2.3, h: 0.3, fontSize: 10, fontFace: "Arial", bold: true, color: NAVY, align: "center", margin: 0 });
    s.addImage({ data: qrCode, x: 7.5, y: 1.6, w: 1.8, h: 1.8 });
    s.addText("Each card gets a different\nQR code linking physical\nto digital.", { x: 7.0, y: 3.5, w: 2.8, h: 0.8, fontSize: 10, fontFace: "Arial", color: "666666", align: "center", margin: 0 });
  }

  // ═══════ SLIDE 3: REVENUE & COSTS ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.dollar, x: 0.8, y: 0.35, w: 0.5, h: 0.5 });
    s.addText("REVENUE AND COSTS", { x: 1.5, y: 0.35, w: 7, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Revenue
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.2, w: 4.2, h: 2.8, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.2, w: 4.2, h: 0.06, fill: { color: GOLD } });
    s.addText("REVENUE", { x: 0.9, y: 1.35, w: 3.6, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    [["200 cards x $20", "$4,000"], ["Gold sponsors (est. 3)", "$1,500"], ["Silver sponsors (est. 5)", "$1,250"], ["Bronze sponsors (est. 3)", "$300"]].forEach((r, i) => {
      s.addText(r[0], { x: 0.9, y: 1.9 + i * 0.45, w: 2.5, h: 0.35, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
      s.addText(r[1], { x: 3.5, y: 1.9 + i * 0.45, w: 1.1, h: 0.35, fontSize: 12, fontFace: "Arial", bold: true, color: GOLD, align: "right", margin: 0 });
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.9, y: 3.65, w: 3.6, h: 0.01, fill: { color: GOLD } });
    s.addText("Projected Total", { x: 0.9, y: 3.7, w: 2.5, h: 0.35, fontSize: 13, fontFace: "Arial", bold: true, color: WHITE, margin: 0 });
    s.addText("$7,050", { x: 3.5, y: 3.7, w: 1.1, h: 0.35, fontSize: 13, fontFace: "Arial Black", bold: true, color: GOLD, align: "right", margin: 0 });

    // Costs
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.2, w: 4.2, h: 2.8, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.2, w: 4.2, h: 0.06, fill: { color: "C0C0C0" } });
    s.addText("COSTS", { x: 5.5, y: 1.35, w: 3.6, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: "C0C0C0", margin: 0 });
    [["Apple Developer (annual)", "$99"], ["Server hosting (annual)", "$60-120"], ["Card printing", "Existing budget"], ["Software licenses", "$0"]].forEach((c, i) => {
      s.addText(c[0], { x: 5.5, y: 1.9 + i * 0.45, w: 2.5, h: 0.35, fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
      s.addText(c[1], { x: 8.1, y: 1.9 + i * 0.45, w: 1.1, h: 0.35, fontSize: 12, fontFace: "Arial", bold: true, color: WHITE, align: "right", margin: 0 });
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 3.65, w: 3.6, h: 0.01, fill: { color: "C0C0C0" } });
    s.addText("Total Cost", { x: 5.5, y: 3.7, w: 2.5, h: 0.35, fontSize: 13, fontFace: "Arial", bold: true, color: LIGHT_GRAY, margin: 0 });
    s.addText("~$160-220", { x: 8.1, y: 3.7, w: 1.1, h: 0.35, fontSize: 13, fontFace: "Arial Black", bold: true, color: WHITE, align: "right", margin: 0 });
  }

  // ═══════ SLIDE 4: FRAUD PREVENTION (with both mockups) ═══════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("FRAUD PREVENTION", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Left side: bullet points
    const items = [
      "Unique Card IDs — no two cards alike",
      "Cardholder's name shown on scan — cashier verifies",
      "Rate limiting — flags 5+ scans in 24hrs",
      "Rapid scan detection — warns if just used elsewhere",
      "Instant deactivation from admin dashboard",
    ];
    items.forEach((item, i) => {
      const y = 1.3 + i * 0.55;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 5.0, h: 0.48, fill: { color: i % 2 === 0 ? OFF_WHITE : WHITE } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.06, h: 0.48, fill: { color: GOLD } });
      s.addText(item, { x: 0.9, y, w: 4.5, h: 0.48, fontSize: 11, fontFace: "Arial", color: NAVY, valign: "middle", margin: 0 });
    });

    // Right side: scan verification mockup (valid + warning side by side)
    s.addText("Valid Scan", { x: 5.8, y: 1.2, w: 2, h: 0.25, fontSize: 9, fontFace: "Arial", bold: true, color: "1a7a1a", align: "center", margin: 0 });
    s.addImage({ data: scanMockup, x: 5.8, y: 1.45, w: 1.9, h: 2.47, sizing: { type: "contain", w: 1.9, h: 2.47 } });

    s.addText("Fraud Warning", { x: 7.9, y: 1.2, w: 2, h: 0.25, fontSize: 9, fontFace: "Arial", bold: true, color: "cc8800", align: "center", margin: 0 });
    s.addImage({ data: fraudMockup, x: 7.9, y: 1.45, w: 1.9, h: 1.9, sizing: { type: "contain", w: 1.9, h: 1.9 } });

    s.addText("Screenshots don't work — cashiers verify the holder's name on screen and the card's scan history.", { x: 0.6, y: 4.8, w: 8.8, h: 0.4, fontSize: 11, fontFace: "Arial", italic: true, color: "888888", margin: 0 });
  }

  // ═══════ SLIDE 5: SPONSOR DATA + PROMOS (with dashboard mockup) ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("SPONSOR DASHBOARDS & PUSH PROMOTIONS", { x: 0.8, y: 0.3, w: 9, h: 0.5, fontSize: 20, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Left: bullet points
    s.addText("Each sponsor gets a private login showing:", { x: 0.8, y: 1.0, w: 4, h: 0.3, fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    ["Total visits from cardholders", "Unique customer count", "Visits by day", "Recent scan history"].forEach((d, i) => {
      s.addText("  " + d, { x: 0.8, y: 1.35 + i * 0.35, w: 4, h: 0.3, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
    });

    s.addText("Push promotions let you:", { x: 0.8, y: 2.95, w: 4, h: 0.3, fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    ["Send deals to every cardholder's phone", "Lock-screen notification on every iPhone", "Card updates automatically in Wallet", "Promotions can have expiration dates"].forEach((p, i) => {
      s.addText("  " + p, { x: 0.8, y: 3.3 + i * 0.35, w: 4, h: 0.3, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
    });

    // Right: sponsor dashboard mockup
    s.addImage({ data: sponsorDash, x: 5.0, y: 0.9, w: 4.8, h: 2.74, sizing: { type: "contain", w: 4.8, h: 2.74 } });

    s.addText("Terms & Conditions, Privacy Policy, and Sponsor Agreement govern all data usage.", { x: 0.8, y: 4.9, w: 8.4, h: 0.3, fontSize: 10, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });
  }

  // ═══════ SLIDE 6: REQUESTING APPROVAL ═══════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: dnLogo, x: 3.5, y: 0.4, w: 3.0, h: 1.8, sizing: { type: "contain", w: 3.0, h: 1.8 } });
    s.addText("REQUESTING BOARD APPROVAL", { x: 0.8, y: 2.2, w: 8.4, h: 0.6, fontSize: 22, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 2.9, w: 3.0, h: 0.04, fill: { color: GOLD } });
    s.addText("Same fundraiser. Better experience.\nMore data. Lower cost.", { x: 0.8, y: 3.2, w: 8.4, h: 0.8, fontSize: 18, fontFace: "Arial", italic: true, color: WHITE, align: "center", margin: 0 });

    [{ val: "~$160", label: "Annual cost" }, { val: "$7K+", label: "Projected revenue" }, { val: "200+", label: "Cards in Wallets" }].forEach((n, i) => {
      const x = 1.5 + i * 2.5;
      s.addText(n.val, { x, y: 4.2, w: 2.2, h: 0.5, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", margin: 0 });
      s.addText(n.label, { x, y: 4.65, w: 2.2, h: 0.3, fontSize: 11, fontFace: "Arial", color: LIGHT_GRAY, align: "center", margin: 0 });
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  await pres.writeFile({ fileName: path.resolve(__dirname, "Del-Norte-Board-Approval.pptx") });
  console.log("  Board deck saved (6 slides)");
}

async function main() {
  console.log("Rebuilding decks with images...\n");
  await buildSponsorDeck();
  await buildBoardDeck();
  console.log("\nDone!");
}

main().catch(console.error);
