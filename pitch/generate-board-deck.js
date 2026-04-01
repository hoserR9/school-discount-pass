const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const { FaShieldAlt, FaChartBar, FaBullhorn, FaDollarSign, FaFootballBall, FaUserCheck } = require("react-icons/fa");

const NAVY = "002D62";
const GOLD = "C5A55A";
const DARK_NAVY = "001A3A";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "A0A0A0";
const LIGHT_GOLD = "D4B96A";
const OFF_WHITE = "F5F0E6";

function renderIconSvg(Icon, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(Icon, { color, size: String(size) }));
}
async function iconPng(Icon, color, size = 256) {
  const svg = renderIconSvg(Icon, color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.2 });

async function main() {
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
    user: await iconPng(FaUserCheck, `#${GOLD}`),
  };

  // ══════════ SLIDE 1: TITLE ══════════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.football, x: 8.5, y: 0.5, w: 0.9, h: 0.9 });

    s.addText("MODERNIZING THE", { x: 0.8, y: 1.2, w: 8, h: 0.5, fontSize: 16, fontFace: "Arial", color: GOLD, charSpacing: 4, margin: 0 });
    s.addText("NIGHTHAWK\nDISCOUNT CARD", { x: 0.8, y: 1.7, w: 8, h: 1.6, fontSize: 42, fontFace: "Arial Black", bold: true, color: WHITE, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.5, w: 2.5, h: 0.04, fill: { color: GOLD } });
    s.addText("Del Norte High School Football\nBoard Review — 2026-2027 Season", { x: 0.8, y: 3.8, w: 8, h: 0.8, fontSize: 14, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // ══════════ SLIDE 2: PROBLEM & SOLUTION ══════════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("THE PROBLEM AND THE SOLUTION", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Two columns
    // Problem
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.4, w: 4.2, h: 3.8, fill: { color: "FFF5F5" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.4, w: 4.2, h: 0.06, fill: { color: "CC0000" } });
    s.addText("CURRENT: PHYSICAL CARD", { x: 0.9, y: 1.6, w: 3.6, h: 0.4, fontSize: 13, fontFace: "Arial", bold: true, color: "CC0000", margin: 0 });
    const problems = ["Costs money to print every year", "Gets lost or forgotten at home", "No way to track actual usage", "Can't update once printed", "No data for sponsors", "Fraud: easy to photocopy"];
    problems.forEach((p, i) => {
      s.addText("  " + p, { x: 0.9, y: 2.1 + i * 0.45, w: 3.6, h: 0.4, fontSize: 12, fontFace: "Arial", color: "666666", margin: 0 });
    });

    // Solution
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.4, w: 4.2, h: 3.8, fill: { color: "F0F8F0" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.4, w: 4.2, h: 0.06, fill: { color: "1a7a1a" } });
    s.addText("PROPOSED: DIGITAL CARD", { x: 5.5, y: 1.6, w: 3.6, h: 0.4, fontSize: 13, fontFace: "Arial", bold: true, color: "1a7a1a", margin: 0 });
    const solutions = ["Zero printing cost for digital", "Always in Apple Wallet on their phone", "Every scan tracked with analytics", "Push new deals anytime mid-season", "Sponsor dashboards with real data", "Unique IDs + fraud detection built in"];
    solutions.forEach((p, i) => {
      s.addText("  " + p, { x: 5.5, y: 2.1 + i * 0.45, w: 3.6, h: 0.4, fontSize: 12, fontFace: "Arial", bold: true, color: "333333", margin: 0 });
    });

    s.addText("Physical cards are still available. Each has a unique QR code linking to the digital version.", { x: 0.8, y: 5.0, w: 8.4, h: 0.4, fontSize: 12, fontFace: "Arial", italic: true, color: "888888", margin: 0 });
  }

  // ══════════ SLIDE 3: REVENUE & COSTS ══════════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.dollar, x: 0.8, y: 0.35, w: 0.5, h: 0.5 });
    s.addText("REVENUE AND COSTS", { x: 1.5, y: 0.35, w: 7, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Revenue box
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.2, w: 4.2, h: 2.8, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.2, w: 4.2, h: 0.06, fill: { color: GOLD } });
    s.addText("REVENUE", { x: 0.9, y: 1.35, w: 3.6, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    const revItems = [
      ["200 cards x $20", "$4,000"],
      ["Gold sponsors (est. 3)", "$1,500"],
      ["Silver sponsors (est. 5)", "$1,250"],
      ["Bronze sponsors (est. 3)", "$300"],
    ];
    revItems.forEach((r, i) => {
      s.addText(r[0], { x: 0.9, y: 1.9 + i * 0.45, w: 2.5, h: 0.35, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
      s.addText(r[1], { x: 3.5, y: 1.9 + i * 0.45, w: 1.1, h: 0.35, fontSize: 12, fontFace: "Arial", bold: true, color: GOLD, align: "right", margin: 0 });
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.9, y: 3.65, w: 3.6, h: 0.01, fill: { color: GOLD } });
    s.addText("Projected Total", { x: 0.9, y: 3.7, w: 2.5, h: 0.35, fontSize: 13, fontFace: "Arial", bold: true, color: WHITE, margin: 0 });
    s.addText("$7,050", { x: 3.5, y: 3.7, w: 1.1, h: 0.35, fontSize: 13, fontFace: "Arial Black", bold: true, color: GOLD, align: "right", margin: 0 });

    // Costs box
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.2, w: 4.2, h: 2.8, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.2, w: 4.2, h: 0.06, fill: { color: "C0C0C0" } });
    s.addText("COSTS", { x: 5.5, y: 1.35, w: 3.6, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: "C0C0C0", margin: 0 });
    const costItems = [
      ["Apple Developer (annual)", "$99"],
      ["Server hosting (annual)", "$60-120"],
      ["Card printing (existing budget)", "$0 add'l"],
      ["Software licenses", "$0"],
    ];
    costItems.forEach((c, i) => {
      s.addText(c[0], { x: 5.5, y: 1.9 + i * 0.45, w: 2.5, h: 0.35, fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
      s.addText(c[1], { x: 8.1, y: 1.9 + i * 0.45, w: 1.1, h: 0.35, fontSize: 12, fontFace: "Arial", bold: true, color: WHITE, align: "right", margin: 0 });
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 3.65, w: 3.6, h: 0.01, fill: { color: "C0C0C0" } });
    s.addText("Total Cost", { x: 5.5, y: 3.7, w: 2.5, h: 0.35, fontSize: 13, fontFace: "Arial", bold: true, color: LIGHT_GRAY, margin: 0 });
    s.addText("~$160-220", { x: 8.1, y: 3.7, w: 1.1, h: 0.35, fontSize: 13, fontFace: "Arial Black", bold: true, color: WHITE, align: "right", margin: 0 });

    s.addText("Net savings vs. physical-only: eliminates reprinting costs when sponsors change mid-season.", { x: 0.8, y: 4.5, w: 8.4, h: 0.4, fontSize: 12, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });
  }

  // ══════════ SLIDE 4: FRAUD PREVENTION ══════════
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("FRAUD PREVENTION AND SECURITY", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const items = [
      { title: "Unique Card IDs", desc: "Each card has a cryptographically generated ID — no two cards are alike. Screenshots show a static image that cashiers are trained to flag." },
      { title: "Name Verification", desc: "When scanned, the verification screen shows the cardholder's name in large text. Cashiers can ask \"Are you John?\" to confirm identity." },
      { title: "Rate Limiting", desc: "Cards scanned more than 5 times in 24 hours are automatically flagged with a yellow warning. Alerts the cashier to verify identity." },
      { title: "Rapid Scan Detection", desc: "If the same card was scanned minutes ago at a different business, a warning shows with the time and location of the last scan." },
      { title: "Instant Deactivation", desc: "Admins can deactivate any card immediately from the dashboard. The card turns red at the next scan attempt." },
    ];

    items.forEach((item, i) => {
      const y = 1.3 + i * 0.82;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 8.4, h: 0.7, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 0.06, h: 0.7, fill: { color: GOLD } });
      s.addText(item.title, { x: 1.1, y, w: 2.2, h: 0.7, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0 });
      s.addText(item.desc, { x: 3.3, y, w: 5.7, h: 0.7, fontSize: 11, fontFace: "Arial", color: "555555", valign: "middle", margin: 0 });
    });
  }

  // ══════════ SLIDE 5: SPONSOR DATA + PROMOTIONS ══════════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("SPONSOR DASHBOARDS AND PROMOTIONS", { x: 0.8, y: 0.35, w: 9, h: 0.5, fontSize: 22, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // Sponsor dashboard box
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.1, w: 4.3, h: 3.5, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.1, w: 4.3, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.chart, x: 0.9, y: 1.25, w: 0.4, h: 0.4 });
    s.addText("SPONSOR DASHBOARDS", { x: 1.4, y: 1.25, w: 3.2, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    s.addText("Each business gets a private login to see:", { x: 0.9, y: 1.75, w: 3.8, h: 0.35, fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    const dashItems = ["Total visits from cardholders", "Unique customer count", "Visits broken down by day", "Recent scan history with dates"];
    dashItems.forEach((d, i) => {
      s.addText("  " + d, { x: 0.9, y: 2.2 + i * 0.4, w: 3.8, h: 0.35, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
    });
    s.addText("No app needed. Works on any phone or computer.\nAccess via a simple code — no passwords.", { x: 0.9, y: 3.9, w: 3.8, h: 0.6, fontSize: 11, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });

    // Promotions box
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.1, w: 4.3, h: 3.5, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.1, w: 4.3, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.bullhorn, x: 5.4, y: 1.25, w: 0.4, h: 0.4 });
    s.addText("PUSH PROMOTIONS", { x: 5.9, y: 1.25, w: 3.2, h: 0.4, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    s.addText("Admin creates a promotion and pushes\nto every cardholder's phone:", { x: 5.4, y: 1.75, w: 3.8, h: 0.5, fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    const promoSteps = ["Admin types the deal in the dashboard", "Clicks \"Push to All Devices\"", "Every iPhone gets a lock-screen notification", "Card in Wallet updates automatically"];
    promoSteps.forEach((p, i) => {
      s.addText((i + 1) + ". " + p, { x: 5.4, y: 2.35 + i * 0.4, w: 3.8, h: 0.35, fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0 });
    });
    s.addText("Sponsors request promos before game days.\nGold tier: 2/month. Silver: 1/month.", { x: 5.4, y: 3.9, w: 3.8, h: 0.6, fontSize: 11, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });

    s.addText("Terms & Conditions, Privacy Policy, and Sponsor Agreement govern all data usage and program participation.", { x: 0.8, y: 4.9, w: 8.4, h: 0.4, fontSize: 10, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });
  }

  // ══════════ SLIDE 6: CLOSING ══════════
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });

    s.addImage({ data: icons.football, x: 4.4, y: 0.8, w: 1.2, h: 1.2 });

    s.addText("REQUESTING BOARD APPROVAL", { x: 0.8, y: 2.2, w: 8.4, h: 0.6, fontSize: 22, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 2.9, w: 3.0, h: 0.04, fill: { color: GOLD } });

    s.addText("Same fundraiser. Better experience.\nMore data. Lower cost.", { x: 0.8, y: 3.2, w: 8.4, h: 0.8, fontSize: 18, fontFace: "Arial", italic: true, color: WHITE, align: "center", margin: 0 });

    // Key numbers
    const nums = [
      { val: "~$160", label: "Annual cost" },
      { val: "$7K+", label: "Projected revenue" },
      { val: "200+", label: "Cards in Wallets" },
    ];
    nums.forEach((n, i) => {
      const x = 1.5 + i * 2.5;
      s.addText(n.val, { x, y: 4.2, w: 2.2, h: 0.5, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", margin: 0 });
      s.addText(n.label, { x, y: 4.65, w: 2.2, h: 0.3, fontSize: 11, fontFace: "Arial", color: LIGHT_GRAY, align: "center", margin: 0 });
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  await pres.writeFile({ fileName: "/Users/joserubio/claude/school-discount-pass/pitch/Del-Norte-Board-Approval.pptx" });
  console.log("Board deck saved!");
}

main().catch(console.error);
