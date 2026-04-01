const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// Icons
const { FaMobileAlt, FaQrcode, FaBullhorn, FaChartBar, FaHandshake, FaRocket, FaStar, FaUsers, FaPhoneAlt, FaFootballBall, FaTrophy, FaBell } = require("react-icons/fa");

// ═══════════════ BRAND COLORS ═══════════════
const NAVY = "002D62";
const GOLD = "C5A55A";
const DARK_NAVY = "001A3A";
const LIGHT_GOLD = "D4B96A";
const WHITE = "FFFFFF";
const OFF_WHITE = "F5F0E6";
const LIGHT_GRAY = "A0A0A0";

// ═══════════════ HELPERS ═══════════════
function renderIconSvg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.2 });

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Del Norte HS Football";
  pres.title = "Del Norte Nighthawk Digital Discount Card — Sponsor Pitch";

  // Pre-render icons
  const icons = {
    mobile: await iconToBase64Png(FaMobileAlt, `#${GOLD}`, 256),
    qr: await iconToBase64Png(FaQrcode, `#${GOLD}`, 256),
    bullhorn: await iconToBase64Png(FaBullhorn, `#${GOLD}`, 256),
    chart: await iconToBase64Png(FaChartBar, `#${GOLD}`, 256),
    handshake: await iconToBase64Png(FaHandshake, `#${GOLD}`, 256),
    rocket: await iconToBase64Png(FaRocket, `#${GOLD}`, 256),
    star: await iconToBase64Png(FaStar, `#${GOLD}`, 256),
    users: await iconToBase64Png(FaUsers, `#${GOLD}`, 256),
    phone: await iconToBase64Png(FaPhoneAlt, `#${GOLD}`, 256),
    football: await iconToBase64Png(FaFootballBall, `#${WHITE}`, 256),
    trophy: await iconToBase64Png(FaTrophy, `#${GOLD}`, 256),
    bell: await iconToBase64Png(FaBell, `#${WHITE}`, 256),
    navyMobile: await iconToBase64Png(FaMobileAlt, `#${NAVY}`, 256),
    navyQr: await iconToBase64Png(FaQrcode, `#${NAVY}`, 256),
    navyBullhorn: await iconToBase64Png(FaBullhorn, `#${NAVY}`, 256),
    navyChart: await iconToBase64Png(FaChartBar, `#${NAVY}`, 256),
    navyHandshake: await iconToBase64Png(FaHandshake, `#${NAVY}`, 256),
    whiteUsers: await iconToBase64Png(FaUsers, `#${WHITE}`, 256),
    whiteStar: await iconToBase64Png(FaStar, `#${WHITE}`, 256),
    whiteChart: await iconToBase64Png(FaChartBar, `#${WHITE}`, 256),
    whiteRocket: await iconToBase64Png(FaRocket, `#${WHITE}`, 256),
  };

  // ══════════════════════════════════════════
  // SLIDE 1: TITLE
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };

    // Gold accent bar at top
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

    // Football icon top right
    s.addImage({ data: icons.football, x: 8.5, y: 0.6, w: 1, h: 1 });

    s.addText("DEL NORTE", {
      x: 0.8, y: 1.0, w: 8, h: 0.8,
      fontSize: 20, fontFace: "Arial", color: GOLD, charSpacing: 8, margin: 0,
    });
    s.addText("NIGHTHAWK", {
      x: 0.8, y: 1.6, w: 8, h: 1.0,
      fontSize: 44, fontFace: "Arial Black", bold: true, color: WHITE, margin: 0,
    });
    s.addText("Digital Discount Card", {
      x: 0.8, y: 2.5, w: 8, h: 0.6,
      fontSize: 24, fontFace: "Arial", color: GOLD, margin: 0,
    });

    // Divider line
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.4, w: 2.5, h: 0.04, fill: { color: GOLD } });

    s.addText("Del Norte High School Football — 2026-2027 Season", {
      x: 0.8, y: 3.7, w: 8, h: 0.5,
      fontSize: 14, fontFace: "Arial", color: LIGHT_GRAY, margin: 0,
    });

    s.addText([
      { text: '"', options: { fontSize: 28, color: GOLD } },
      { text: "Your business in every fan's pocket", options: { fontSize: 18, italic: true, color: WHITE } },
      { text: '"', options: { fontSize: 28, color: GOLD } },
    ], { x: 0.8, y: 4.3, w: 8, h: 0.7, margin: 0 });

    // Gold accent bar at bottom
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // ══════════════════════════════════════════
  // SLIDE 2: THE OPPORTUNITY
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };

    // Navy header bar
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("THE OPPORTUNITY", {
      x: 0.8, y: 0.25, w: 8, h: 0.6,
      fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0,
    });

    // Three card blocks
    const cards = [
      { icon: icons.navyMobile, title: "Always With Them", desc: "Every cardholder carries your brand in their Apple Wallet — visible every time they open their phone" },
      { icon: icons.navyBullhorn, title: "Stay Top-of-Mind", desc: "Unlike a physical card in a drawer, a digital card sends notifications and keeps your business front and center" },
      { icon: icons.navyHandshake, title: "Passionate Community", desc: "Del Norte Football has a dedicated community of students, parents, alumni, and fans — your customers" },
    ];

    cards.forEach((c, i) => {
      const y = 1.5 + i * 1.3;
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.8, y, w: 8.4, h: 1.1,
        fill: { color: OFF_WHITE }, shadow: makeShadow(),
      });
      // Gold left accent
      s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 0.07, h: 1.1, fill: { color: GOLD } });
      s.addImage({ data: c.icon, x: 1.15, y: y + 0.25, w: 0.55, h: 0.55 });
      s.addText(c.title, {
        x: 2.0, y: y + 0.1, w: 6.8, h: 0.4,
        fontSize: 16, fontFace: "Arial", bold: true, color: NAVY, margin: 0,
      });
      s.addText(c.desc, {
        x: 2.0, y: y + 0.5, w: 6.8, h: 0.5,
        fontSize: 12, fontFace: "Arial", color: "555555", margin: 0,
      });
    });
  }

  // ══════════════════════════════════════════
  // SLIDE 3: HOW IT WORKS — CUSTOMER
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

    s.addText("HOW IT WORKS — FOR THE CUSTOMER", {
      x: 0.8, y: 0.4, w: 9, h: 0.6,
      fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0,
    });

    const steps = [
      { num: "1", text: "Fan visits our page or scans a link and taps \"Add to Apple Wallet\"" },
      { num: "2", text: "The Nighthawk Discount Card appears in their Wallet — gold and navy, school branding" },
      { num: "3", text: "At your business, they show the card or the cashier scans the QR code" },
      { num: "4", text: "Discount is applied — simple, fast, no paper coupons" },
    ];

    steps.forEach((st, i) => {
      const y = 1.3 + i * 1.0;
      // Number circle
      s.addShape(pres.shapes.OVAL, { x: 1.0, y: y + 0.05, w: 0.6, h: 0.6, fill: { color: GOLD } });
      s.addText(st.num, {
        x: 1.0, y: y + 0.05, w: 0.6, h: 0.6,
        fontSize: 20, fontFace: "Arial Black", bold: true, color: NAVY, align: "center", valign: "middle", margin: 0,
      });
      // Text
      s.addText(st.text, {
        x: 2.0, y: y, w: 7.2, h: 0.7,
        fontSize: 16, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0,
      });
      // Connecting line
      if (i < 3) {
        s.addShape(pres.shapes.RECTANGLE, { x: 1.27, y: y + 0.65, w: 0.06, h: 0.35, fill: { color: GOLD, transparency: 40 } });
      }
    });
  }

  // ══════════════════════════════════════════
  // SLIDE 4: HOW IT WORKS — SPONSOR
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("HOW IT WORKS — FOR YOU", {
      x: 0.8, y: 0.25, w: 8, h: 0.6,
      fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0,
    });

    const items = [
      { icon: icons.navyMobile, text: "Your business name and discount are listed on the back of every digital card" },
      { icon: icons.navyQr, text: "When a customer scans the QR code at your location, that visit is tracked" },
      { icon: icons.navyChart, text: "You receive reports showing visits and unique customers from the program" },
      { icon: icons.navyHandshake, text: "No POS changes needed — cashier just scans and applies the discount" },
    ];

    items.forEach((item, i) => {
      const y = 1.5 + i * 0.95;
      s.addImage({ data: item.icon, x: 1.0, y: y + 0.05, w: 0.5, h: 0.5 });
      s.addText(item.text, {
        x: 1.8, y: y, w: 7.4, h: 0.7,
        fontSize: 15, fontFace: "Arial", color: "333333", valign: "middle", margin: 0,
      });
    });
  }

  // ══════════════════════════════════════════
  // SLIDE 5: WHY DIGITAL BEATS PHYSICAL
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

    s.addText("WHY DIGITAL BEATS PHYSICAL", {
      x: 0.8, y: 0.4, w: 9, h: 0.6,
      fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0,
    });

    // Two columns: Physical vs Digital
    // Physical column header
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.2, w: 4.0, h: 0.6, fill: { color: "4A4A4A" } });
    s.addText("Physical Card", {
      x: 0.8, y: 1.2, w: 4.0, h: 0.6,
      fontSize: 16, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0,
    });

    // Digital column header
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.2, w: 4.0, h: 0.6, fill: { color: GOLD } });
    s.addText("Digital Card", {
      x: 5.2, y: 1.2, w: 4.0, h: 0.6,
      fontSize: 16, fontFace: "Arial", bold: true, color: NAVY, align: "center", valign: "middle", margin: 0,
    });

    const comparisons = [
      ["Gets lost, forgotten at home", "Always in their phone"],
      ["No way to track usage", "Every scan is tracked"],
      ["Static — can't change once printed", "Push new deals anytime"],
      ["One-time impression", "Ongoing notifications"],
      ["Printing costs", "Zero printing costs"],
    ];

    comparisons.forEach((row, i) => {
      const y = 1.9 + i * 0.65;
      const bgColor = i % 2 === 0 ? "0A1A35" : "0E2040";
      s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 4.0, h: 0.6, fill: { color: bgColor } });
      s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y, w: 4.0, h: 0.6, fill: { color: bgColor } });

      s.addText(row[0], {
        x: 1.0, y, w: 3.6, h: 0.6,
        fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, valign: "middle", margin: 0,
      });
      s.addText(row[1], {
        x: 5.4, y, w: 3.6, h: 0.6,
        fontSize: 12, fontFace: "Arial", bold: true, color: GOLD, valign: "middle", margin: 0,
      });
    });
  }

  // ══════════════════════════════════════════
  // SLIDE 6: PUSH PROMOTIONS
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };

    s.addImage({ data: icons.bell, x: 0.8, y: 0.4, w: 0.6, h: 0.6 });
    s.addText("PUSH PROMOTIONS", {
      x: 1.6, y: 0.4, w: 7, h: 0.6,
      fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0,
    });
    s.addText("The Game Changer", {
      x: 1.6, y: 0.9, w: 7, h: 0.4,
      fontSize: 16, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0,
    });

    s.addText("Push limited-time promotions directly to every cardholder's phone.", {
      x: 0.8, y: 1.5, w: 8.4, h: 0.5,
      fontSize: 15, fontFace: "Arial", color: WHITE, margin: 0,
    });

    // Example promo "cards"
    const promos = [
      "Game Day Special: 20% off at Board & Brew — tonight only!",
      "Homecoming Weekend: Buy one get one at Baskin Robbins",
      "End of Season: Double discount at all sponsors this week",
    ];

    promos.forEach((p, i) => {
      const y = 2.3 + i * 0.8;
      s.addShape(pres.shapes.RECTANGLE, {
        x: 1.2, y, w: 7.6, h: 0.65,
        fill: { color: DARK_NAVY }, shadow: makeShadow(),
      });
      s.addShape(pres.shapes.RECTANGLE, { x: 1.2, y, w: 0.07, h: 0.65, fill: { color: GOLD } });
      s.addText(p, {
        x: 1.6, y, w: 7.0, h: 0.65,
        fontSize: 13, fontFace: "Arial", italic: true, color: WHITE, valign: "middle", margin: 0,
      });
    });

    s.addText("Cardholders get a lock-screen notification and their card updates automatically.\nThis drives real foot traffic to your business on the days that matter most.", {
      x: 0.8, y: 4.5, w: 8.4, h: 0.8,
      fontSize: 13, fontFace: "Arial", color: LIGHT_GOLD, margin: 0,
    });
  }

  // ══════════════════════════════════════════
  // SLIDE 7: WHAT SPONSORS GET
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WHAT SPONSORS GET", {
      x: 0.8, y: 0.25, w: 8, h: 0.6,
      fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0,
    });

    const benefits = [
      { icon: icons.navyMobile, title: "Brand Visibility", desc: "On every digital card — hundreds of fans" },
      { icon: icons.navyBullhorn, title: "Push Promotion Access", desc: "Request a featured promotion before game days or events" },
      { icon: icons.navyChart, title: "Usage Reports", desc: "See exactly how many customers used the card at your business" },
      { icon: icons.navyHandshake, title: "Community Goodwill", desc: "Your business supports local student athletes" },
      { icon: icons.navyQr, title: "Zero Setup", desc: "No app, no POS integration, no tech hassle" },
    ];

    benefits.forEach((b, i) => {
      const y = 1.4 + i * 0.8;
      s.addImage({ data: b.icon, x: 1.0, y: y + 0.08, w: 0.45, h: 0.45 });
      s.addText(b.title, {
        x: 1.7, y: y, w: 3, h: 0.35,
        fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0,
      });
      s.addText(b.desc, {
        x: 1.7, y: y + 0.32, w: 7, h: 0.35,
        fontSize: 12, fontFace: "Arial", color: "666666", margin: 0,
      });
    });
  }

  // ══════════════════════════════════════════
  // SLIDE 8: TRACKING & REPORTING
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

    s.addText("TRACKING & REPORTING", {
      x: 0.8, y: 0.4, w: 9, h: 0.6,
      fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0,
    });

    s.addText("Every QR code scan is logged with date and time.", {
      x: 0.8, y: 1.1, w: 8.4, h: 0.4,
      fontSize: 15, fontFace: "Arial", color: WHITE, margin: 0,
    });

    // Big stat callouts
    const stats = [
      { num: "Total Visits", desc: "From cardholders" },
      { num: "Unique\nCustomers", desc: "Individual card IDs" },
      { num: "Busiest\nDays", desc: "Peak traffic times" },
    ];

    stats.forEach((st, i) => {
      const x = 0.8 + i * 3.0;
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: 1.8, w: 2.7, h: 2.0,
        fill: { color: "0A1A35" }, shadow: makeShadow(),
      });
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.8, w: 2.7, h: 0.06, fill: { color: GOLD } });
      s.addText(st.num, {
        x, y: 2.0, w: 2.7, h: 1.0,
        fontSize: 20, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", valign: "middle", margin: 0,
      });
      s.addText(st.desc, {
        x, y: 3.0, w: 2.7, h: 0.5,
        fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, align: "center", margin: 0,
      });
    });

    s.addText("Use this data to measure ROI and plan future promotions.", {
      x: 0.8, y: 4.3, w: 8.4, h: 0.5,
      fontSize: 14, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0,
    });
  }

  // ══════════════════════════════════════════
  // SLIDE 9: CURRENT SPONSORS
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("CURRENT SPONSORS (2026-2027)", {
      x: 0.8, y: 0.25, w: 8, h: 0.6,
      fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0,
    });

    const sponsors = [
      "Baskin Robbins", "Harland Brewing", "Board & Brew",
      "L&L Hawaiian Barbecue", "Kahoots", "Mostra Coffee",
      "Rosinas", "Donut Touch", "Sushi Ren",
      "Flippin Pizza", "Round Table Pizza",
    ];

    // 3-column grid
    sponsors.forEach((sp, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.8 + col * 3.0;
      const y = 1.4 + row * 0.9;

      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 2.7, h: 0.7,
        fill: { color: OFF_WHITE }, shadow: makeShadow(),
      });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 0.7, fill: { color: GOLD } });
      s.addText(sp, {
        x: x + 0.2, y, w: 2.3, h: 0.7,
        fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0,
      });
    });

    s.addText("Join them and put your business in front of the entire Nighthawk community.", {
      x: 0.8, y: 5.0, w: 8.4, h: 0.4,
      fontSize: 13, fontFace: "Arial", italic: true, color: "888888", margin: 0,
    });
  }

  // ══════════════════════════════════════════
  // SLIDE 10: SPONSORSHIP TIERS
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

    s.addText("SPONSORSHIP TIERS", {
      x: 0.8, y: 0.3, w: 9, h: 0.6,
      fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0,
    });

    const tiers = [
      {
        name: "GOLD", price: "$500", color: GOLD, textColor: NAVY,
        perks: ["Featured at the top of the card", "2 push promotions per month", "Monthly usage reports", "Logo on game day materials"],
      },
      {
        name: "SILVER", price: "$250", color: "C0C0C0", textColor: NAVY,
        perks: ["Listed on the card", "1 push promotion per month", "Quarterly usage reports", ""],
      },
      {
        name: "BRONZE", price: "$100", color: "CD7F32", textColor: WHITE,
        perks: ["Listed on the card", "Seasonal usage reports", "", ""],
      },
    ];

    tiers.forEach((tier, i) => {
      const x = 0.6 + i * 3.15;
      const w = 2.9;

      // Card background
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: 1.1, w, h: 4.2,
        fill: { color: "0A1A35" }, shadow: makeShadow(),
      });
      // Tier header
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.1, w, h: 1.2, fill: { color: tier.color } });
      s.addText(tier.name, {
        x, y: 1.15, w, h: 0.6,
        fontSize: 20, fontFace: "Arial Black", bold: true, color: tier.textColor, align: "center", valign: "middle", margin: 0,
      });
      s.addText(tier.price, {
        x, y: 1.7, w, h: 0.55,
        fontSize: 32, fontFace: "Arial Black", bold: true, color: tier.textColor, align: "center", valign: "middle", margin: 0,
      });

      // Perks
      tier.perks.forEach((perk, j) => {
        if (!perk) return;
        const py = 2.6 + j * 0.6;
        s.addText(perk, {
          x: x + 0.3, y: py, w: w - 0.6, h: 0.5,
          fontSize: 11, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0,
        });
        if (j < tier.perks.filter(Boolean).length - 1) {
          s.addShape(pres.shapes.RECTANGLE, { x: x + 0.3, y: py + 0.5, w: w - 0.6, h: 0.01, fill: { color: "1E2A42" } });
        }
      });
    });
  }

  // ══════════════════════════════════════════
  // SLIDE 11: HOW TO GET STARTED
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("HOW TO GET STARTED", {
      x: 0.8, y: 0.25, w: 8, h: 0.6,
      fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0,
    });

    const steps = [
      "Choose your sponsorship tier",
      "Tell us your discount offer (e.g., 10% off, BOGO, etc.)",
      "We add your business to the card — it goes live immediately",
      "Existing cardholders get a push notification about your business",
      "Start seeing customers walk in with the Nighthawk Card",
    ];

    steps.forEach((step, i) => {
      const y = 1.5 + i * 0.75;
      s.addShape(pres.shapes.OVAL, { x: 1.0, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: NAVY } });
      s.addText(String(i + 1), {
        x: 1.0, y: y + 0.05, w: 0.5, h: 0.5,
        fontSize: 16, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", valign: "middle", margin: 0,
      });
      s.addText(step, {
        x: 1.8, y: y, w: 7.4, h: 0.6,
        fontSize: 15, fontFace: "Arial", color: "333333", valign: "middle", margin: 0,
      });
    });
  }

  // ══════════════════════════════════════════
  // SLIDE 12: CONTACT / CLOSING
  // ══════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

    s.addImage({ data: icons.football, x: 4.4, y: 0.8, w: 1.2, h: 1.2 });

    s.addText("DEL NORTE HIGH SCHOOL FOOTBALL", {
      x: 0.8, y: 2.2, w: 8.4, h: 0.6,
      fontSize: 20, fontFace: "Arial Black", bold: true, color: WHITE, align: "center", margin: 0,
    });
    s.addText("Nighthawk Discount Card Program", {
      x: 0.8, y: 2.7, w: 8.4, h: 0.5,
      fontSize: 16, fontFace: "Arial", color: GOLD, align: "center", margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.4, w: 3.0, h: 0.04, fill: { color: GOLD } });

    s.addText([
      { text: '"', options: { fontSize: 28, color: GOLD } },
      { text: "Support student athletes. Drive customers to your door.", options: { fontSize: 18, italic: true, color: WHITE } },
      { text: '"', options: { fontSize: 28, color: GOLD } },
    ], { x: 0.8, y: 3.8, w: 8.4, h: 0.8, align: "center", margin: 0 });

    s.addText("Contact us to get started", {
      x: 0.8, y: 4.8, w: 8.4, h: 0.5,
      fontSize: 14, fontFace: "Arial", color: LIGHT_GRAY, align: "center", margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // ═══════════════ SAVE ═══════════════
  await pres.writeFile({ fileName: "/Users/joserubio/claude/school-discount-pass/pitch/Del-Norte-Nighthawk-Sponsor-Pitch.pptx" });
  console.log("Presentation saved successfully!");
}

main().catch(console.error);
