/**
 * Render mockup images for the pitch decks:
 * 1. Apple Wallet pass (front view)
 * 2. Scan verification screen (cashier view)
 * 3. Sponsor dashboard
 * 4. Claim page (mobile)
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const OUT = path.resolve(__dirname, "images");
fs.mkdirSync(OUT, { recursive: true });

// ═══════════ WALLET PASS MOCKUP ═══════════
async function renderWalletPass() {
  const w = 400, h = 620;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <!-- iPhone frame -->
    <rect x="0" y="0" width="${w}" height="${h}" rx="30" fill="#1a1a1a"/>
    <rect x="8" y="8" width="${w-16}" height="${h-16}" rx="26" fill="#000"/>

    <!-- Status bar -->
    <text x="30" y="38" font-family="Arial" font-size="13" fill="#fff">9:41</text>
    <text x="${w-30}" y="38" font-family="Arial" font-size="13" fill="#fff" text-anchor="end">100%</text>

    <!-- Wallet pass card -->
    <rect x="20" y="60" width="${w-40}" height="440" rx="14" fill="#C5A55A"/>

    <!-- Logo area -->
    <text x="40" y="95" font-family="Arial" font-weight="900" font-size="13" fill="#002D62" letter-spacing="2">DEL NORTE</text>
    <text x="${w-40}" y="95" font-family="Arial" font-size="11" fill="#002D62" text-anchor="end">DN Football</text>

    <!-- Primary field -->
    <text x="40" y="135" font-family="Arial" font-size="10" fill="#002D62" opacity="0.7">NIGHTHAWK</text>
    <text x="40" y="158" font-family="Arial Black" font-weight="900" font-size="22" fill="#002D62">DISCOUNT CARD</text>

    <!-- Secondary fields -->
    <text x="40" y="195" font-family="Arial" font-size="10" fill="#002D62" opacity="0.7">VALUE</text>
    <text x="40" y="213" font-family="Arial" font-weight="700" font-size="16" fill="#002D62">$20</text>
    <text x="200" y="195" font-family="Arial" font-size="10" fill="#002D62" opacity="0.7">VALID THRU</text>
    <text x="200" y="213" font-family="Arial" font-weight="700" font-size="16" fill="#002D62">07/31/2027</text>

    <!-- Auxiliary fields -->
    <text x="40" y="248" font-family="Arial" font-size="10" fill="#002D62" opacity="0.7">CARD ID</text>
    <text x="40" y="266" font-family="monospace" font-weight="700" font-size="14" fill="#002D62">DN-8F3A2B1C</text>
    <text x="200" y="248" font-family="Arial" font-size="10" fill="#002D62" opacity="0.7">PROMO CODE</text>
    <text x="200" y="266" font-family="Arial Black" font-weight="900" font-size="16" fill="#002D62" letter-spacing="2">DN2026</text>

    <!-- Divider -->
    <line x1="40" y1="285" x2="${w-60}" y2="285" stroke="#002D62" stroke-width="0.5" opacity="0.3"/>

    <!-- QR Code area -->
    <rect x="${(w-160)/2}" y="300" width="160" height="160" rx="8" fill="white"/>
    <!-- QR pattern (simplified) -->
    <rect x="${(w-140)/2}" y="310" width="140" height="140" rx="4" fill="white"/>
    <!-- QR finder patterns -->
    <rect x="${(w-130)/2}" y="315" width="30" height="30" rx="2" fill="#002D62"/>
    <rect x="${(w-130)/2+5}" y="320" width="20" height="20" rx="1" fill="white"/>
    <rect x="${(w-130)/2+9}" y="324" width="12" height="12" rx="1" fill="#002D62"/>
    <rect x="${(w+70)/2}" y="315" width="30" height="30" rx="2" fill="#002D62"/>
    <rect x="${(w+70)/2+5}" y="320" width="20" height="20" rx="1" fill="white"/>
    <rect x="${(w+70)/2+9}" y="324" width="12" height="12" rx="1" fill="#002D62"/>
    <rect x="${(w-130)/2}" y="415" width="30" height="30" rx="2" fill="#002D62"/>
    <rect x="${(w-130)/2+5}" y="420" width="20" height="20" rx="1" fill="white"/>
    <rect x="${(w-130)/2+9}" y="424" width="12" height="12" rx="1" fill="#002D62"/>
    <!-- QR data dots -->
    ${generateQRDots(w)}

    <!-- QR alt text -->
    <text x="${w/2}" y="480" font-family="monospace" font-size="11" fill="#002D62" text-anchor="middle">DN-8F3A2B1C</text>

    <!-- Bottom bar -->
    <rect x="20" y="490" width="${w-40}" height="10" rx="0 0 14 14" fill="#b89840"/>

    <!-- Home indicator -->
    <rect x="${(w-120)/2}" y="575" width="120" height="4" rx="2" fill="#666"/>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, "wallet-pass-mockup.png"));
  console.log("  wallet-pass-mockup.png");
}

function generateQRDots(w) {
  const cx = w / 2;
  let dots = "";
  const seed = [
    [0,0,1,1,0,1,0,1,1,0],
    [1,0,1,0,1,0,1,0,0,1],
    [0,1,0,1,1,1,0,1,1,0],
    [1,1,0,0,1,0,1,1,0,1],
    [0,1,1,0,0,1,1,0,1,0],
    [1,0,0,1,1,0,0,1,0,1],
    [0,1,1,1,0,1,0,0,1,1],
    [1,0,1,0,1,0,1,1,0,0],
  ];
  for (let r = 0; r < seed.length; r++) {
    for (let c = 0; c < seed[r].length; c++) {
      if (seed[r][c]) {
        const x = cx - 50 + c * 10;
        const y = 355 + r * 10;
        dots += `<rect x="${x}" y="${y}" width="8" height="8" fill="#002D62"/>`;
      }
    }
  }
  return dots;
}

// ═══════════ SCAN VERIFICATION MOCKUP ═══════════
async function renderScanVerification() {
  const w = 400, h = 520;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" rx="16" fill="#1a7a1a"/>

    <!-- Card -->
    <rect x="20" y="20" width="${w-40}" height="${h-40}" rx="16" fill="rgba(0,0,0,0.2)"/>

    <!-- Check mark -->
    <text x="${w/2}" y="80" font-size="48" text-anchor="middle" fill="white">&#10003;</text>

    <!-- Title -->
    <text x="${w/2}" y="115" font-family="Arial Black" font-size="20" fill="white" text-anchor="middle">DEL NORTE NIGHTHAWK</text>
    <text x="${w/2}" y="140" font-family="Arial" font-size="14" fill="white" text-anchor="middle" opacity="0.8">Discount Card — VALID</text>

    <!-- Holder name (large) -->
    <rect x="40" y="155" width="${w-80}" height="42" rx="8" fill="rgba(255,255,255,0.15)"/>
    <text x="${w/2}" y="183" font-family="Arial" font-weight="700" font-size="20" fill="white" text-anchor="middle">JOHN DOE</text>

    <!-- Details -->
    <text x="50" y="225" font-family="Arial" font-size="12" fill="white" opacity="0.7">Card ID</text>
    <text x="${w-50}" y="225" font-family="Arial" font-size="12" fill="white" text-anchor="end">DN-8F3A2B1C</text>
    <line x1="50" y1="235" x2="${w-50}" y2="235" stroke="white" stroke-width="0.5" opacity="0.2"/>

    <text x="50" y="258" font-family="Arial" font-size="12" fill="white" opacity="0.7">Valid Thru</text>
    <text x="${w-50}" y="258" font-family="Arial" font-size="12" fill="white" text-anchor="end">2027-07-31</text>
    <line x1="50" y1="268" x2="${w-50}" y2="268" stroke="white" stroke-width="0.5" opacity="0.2"/>

    <text x="50" y="291" font-family="Arial" font-size="12" fill="white" opacity="0.7">Total Scans</text>
    <text x="${w-50}" y="291" font-family="Arial" font-size="12" fill="white" text-anchor="end">7</text>
    <line x1="50" y1="301" x2="${w-50}" y2="301" stroke="white" stroke-width="0.5" opacity="0.2"/>

    <text x="50" y="324" font-family="Arial" font-size="12" fill="white" opacity="0.7">Today</text>
    <text x="${w-50}" y="324" font-family="Arial" font-size="12" fill="white" text-anchor="end">1 scan</text>
    <line x1="50" y1="334" x2="${w-50}" y2="334" stroke="white" stroke-width="0.5" opacity="0.2"/>

    <text x="50" y="357" font-family="Arial" font-size="12" fill="white" opacity="0.7">Last Scan</text>
    <text x="${w-50}" y="357" font-family="Arial" font-size="12" fill="white" text-anchor="end">2026-10-04 at Mostra Coffee</text>

    <!-- Cashier tip -->
    <text x="${w/2}" y="400" font-family="Arial" font-size="11" fill="white" text-anchor="middle" opacity="0.6" font-style="italic">Tip: Ask the customer to confirm their name matches above</text>

    <!-- Promo section -->
    <rect x="40" y="420" width="${w-80}" height="55" rx="8" fill="rgba(255,255,255,0.2)"/>
    <text x="55" y="442" font-family="Arial" font-weight="700" font-size="11" fill="white">Current Promotions:</text>
    <text x="55" y="460" font-family="Arial" font-size="11" fill="white">Game Day: 20% off at Board &amp; Brew tonight!</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, "scan-verification-mockup.png"));
  console.log("  scan-verification-mockup.png");
}

// ═══════════ FRAUD WARNING MOCKUP ═══════════
async function renderFraudWarning() {
  const w = 400, h = 400;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" rx="16" fill="#cc8800"/>
    <rect x="20" y="20" width="${w-40}" height="${h-40}" rx="16" fill="rgba(0,0,0,0.2)"/>

    <!-- Warning icon -->
    <text x="${w/2}" y="75" font-size="48" text-anchor="middle" fill="white">&#9888;</text>

    <text x="${w/2}" y="110" font-family="Arial Black" font-size="18" fill="white" text-anchor="middle">DEL NORTE NIGHTHAWK</text>
    <text x="${w/2}" y="132" font-family="Arial" font-size="13" fill="white" text-anchor="middle" opacity="0.8">Discount Card — VALID — CHECK ID</text>

    <!-- Holder name -->
    <rect x="40" y="145" width="${w-80}" height="38" rx="8" fill="rgba(255,255,255,0.15)"/>
    <text x="${w/2}" y="170" font-family="Arial" font-weight="700" font-size="18" fill="white" text-anchor="middle">JOHN DOE</text>

    <!-- Warning box -->
    <rect x="40" y="195" width="${w-80}" height="65" rx="8" fill="rgba(0,0,0,0.3)" stroke="white" stroke-width="2"/>
    <text x="55" y="218" font-family="Arial" font-weight="600" font-size="12" fill="white">&#9888; Used 6 times in 24hrs — possible sharing</text>
    <text x="55" y="240" font-family="Arial" font-weight="600" font-size="12" fill="white">&#9888; Just scanned 3min ago at Sushi Ren</text>

    <!-- Details -->
    <text x="50" y="290" font-family="Arial" font-size="12" fill="white" opacity="0.7">Card ID</text>
    <text x="${w-50}" y="290" font-family="Arial" font-size="12" fill="white" text-anchor="end">DN-8F3A2B1C</text>
    <text x="50" y="318" font-family="Arial" font-size="12" fill="white" opacity="0.7">Today</text>
    <text x="${w-50}" y="318" font-family="Arial" font-size="12" fill="white" text-anchor="end">6 scans</text>

    <text x="${w/2}" y="360" font-family="Arial" font-size="11" fill="white" text-anchor="middle" opacity="0.6" font-style="italic">Tip: Ask the customer to confirm their name matches above</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, "fraud-warning-mockup.png"));
  console.log("  fraud-warning-mockup.png");
}

// ═══════════ SPONSOR DASHBOARD MOCKUP ═══════════
async function renderSponsorDashboard() {
  const w = 700, h = 450;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" rx="12" fill="#f5f0e6"/>

    <!-- Header -->
    <rect x="0" y="0" width="${w}" height="50" rx="12" fill="#002D62"/>
    <rect x="0" y="25" width="${w}" height="25" fill="#002D62"/>
    <text x="20" y="33" font-family="Arial" font-weight="700" font-size="16" fill="#C5A55A">Nighthawk Card — Board &amp; Brew</text>
    <rect x="${w-80}" y="14" width="60" height="24" rx="10" fill="#C5A55A"/>
    <text x="${w-50}" y="31" font-family="Arial" font-weight="700" font-size="10" fill="#002D62" text-anchor="middle">GOLD</text>

    <!-- Stats cards -->
    <rect x="20" y="70" width="145" height="80" rx="10" fill="white"/>
    <text x="92" y="110" font-family="Arial Black" font-size="32" fill="#002D62" text-anchor="middle">47</text>
    <text x="92" y="130" font-family="Arial" font-size="10" fill="#888" text-anchor="middle" letter-spacing="1">TOTAL VISITS</text>

    <rect x="185" y="70" width="145" height="80" rx="10" fill="white"/>
    <text x="257" y="110" font-family="Arial Black" font-size="32" fill="#002D62" text-anchor="middle">31</text>
    <text x="257" y="130" font-family="Arial" font-size="10" fill="#888" text-anchor="middle" letter-spacing="1">UNIQUE CUSTOMERS</text>

    <rect x="350" y="70" width="145" height="80" rx="10" fill="white"/>
    <text x="422" y="110" font-family="Arial Black" font-size="28" fill="#002D62" text-anchor="middle">Oct 4</text>
    <text x="422" y="130" font-family="Arial" font-size="10" fill="#888" text-anchor="middle" letter-spacing="1">LAST VISIT</text>

    <!-- Recent visits table -->
    <text x="20" y="180" font-family="Arial" font-weight="700" font-size="13" fill="#002D62" letter-spacing="1">RECENT VISITS</text>

    <rect x="20" y="190" width="${w-40}" height="240" rx="10" fill="white"/>
    <!-- Header row -->
    <rect x="20" y="190" width="${w-40}" height="30" rx="10" fill="#002D62"/>
    <rect x="20" y="205" width="${w-40}" height="15" fill="#002D62"/>
    <text x="35" y="210" font-family="Arial" font-size="10" fill="#C5A55A" letter-spacing="1">DATE</text>
    <text x="250" y="210" font-family="Arial" font-size="10" fill="#C5A55A" letter-spacing="1">CARD ID</text>
    <text x="450" y="210" font-family="Arial" font-size="10" fill="#C5A55A" letter-spacing="1">CUSTOMER</text>

    <!-- Data rows -->
    <text x="35" y="245" font-family="Arial" font-size="12" fill="#333">2026-10-04 18:32</text>
    <text x="250" y="245" font-family="monospace" font-size="12" fill="#333">DN-8F3A2B1C</text>
    <text x="450" y="245" font-family="Arial" font-size="12" fill="#333">John D.</text>
    <line x1="35" y1="255" x2="${w-55}" y2="255" stroke="#eee" stroke-width="1"/>

    <text x="35" y="278" font-family="Arial" font-size="12" fill="#333">2026-10-04 17:15</text>
    <text x="250" y="278" font-family="monospace" font-size="12" fill="#333">DN-4D7E9F01</text>
    <text x="450" y="278" font-family="Arial" font-size="12" fill="#333">Sarah M.</text>
    <line x1="35" y1="288" x2="${w-55}" y2="288" stroke="#eee" stroke-width="1"/>

    <text x="35" y="311" font-family="Arial" font-size="12" fill="#333">2026-10-03 12:44</text>
    <text x="250" y="311" font-family="monospace" font-size="12" fill="#333">DN-A46BB3D8</text>
    <text x="450" y="311" font-family="Arial" font-size="12" fill="#333">General</text>
    <line x1="35" y1="321" x2="${w-55}" y2="321" stroke="#eee" stroke-width="1"/>

    <text x="35" y="344" font-family="Arial" font-size="12" fill="#333">2026-10-03 11:20</text>
    <text x="250" y="344" font-family="monospace" font-size="12" fill="#333">DN-EC014B40</text>
    <text x="450" y="344" font-family="Arial" font-size="12" fill="#333">Mike R.</text>
    <line x1="35" y1="354" x2="${w-55}" y2="354" stroke="#eee" stroke-width="1"/>

    <text x="35" y="377" font-family="Arial" font-size="12" fill="#333">2026-10-02 19:08</text>
    <text x="250" y="377" font-family="monospace" font-size="12" fill="#333">DN-553461B0</text>
    <text x="450" y="377" font-family="Arial" font-size="12" fill="#333">Lisa T.</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, "sponsor-dashboard-mockup.png"));
  console.log("  sponsor-dashboard-mockup.png");
}

// ═══════════ CLAIM PAGE MOCKUP ═══════════
async function renderClaimPage() {
  const w = 400, h = 550;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" rx="16" fill="#002D62"/>

    <!-- Gold card -->
    <rect x="30" y="30" width="${w-60}" height="310" rx="16" fill="#C5A55A"/>

    <text x="${w/2}" y="72" font-family="Arial Black" font-size="16" fill="#002D62" text-anchor="middle" letter-spacing="3">DEL NORTE</text>
    <text x="${w/2}" y="102" font-family="Arial Black" font-size="26" fill="#002D62" text-anchor="middle">NIGHTHAWK</text>
    <text x="${w/2}" y="125" font-family="Arial" font-weight="600" font-size="14" fill="#002D62" text-anchor="middle">DISCOUNT CARD</text>

    <!-- Card ID -->
    <rect x="110" y="140" width="${w-220}" height="28" rx="6" fill="rgba(0,45,98,0.15)"/>
    <text x="${w/2}" y="159" font-family="monospace" font-size="12" fill="#002D62" text-anchor="middle" letter-spacing="2">DN-8F3A2B1C</text>

    <text x="${w/2}" y="190" font-family="Arial" font-size="12" fill="#002D62" text-anchor="middle">Scan successful! Add this card to your Apple Wallet.</text>

    <!-- Name input -->
    <text x="50" y="218" font-family="Arial" font-size="10" fill="#002D62" letter-spacing="1">YOUR NAME (OPTIONAL)</text>
    <rect x="50" y="225" width="${w-100}" height="36" rx="8" fill="rgba(255,255,255,0.6)" stroke="#002D62" stroke-width="1"/>
    <text x="65" y="248" font-family="Arial" font-size="14" fill="#002D62" opacity="0.4">e.g. John Doe</text>

    <!-- Add to Wallet button -->
    <rect x="80" y="280" width="${w-160}" height="44" rx="12" fill="black"/>
    <text x="${w/2}" y="307" font-family="Arial" font-weight="600" font-size="15" fill="white" text-anchor="middle">Add to Apple Wallet</text>

    <!-- Info text -->
    <text x="${w/2}" y="375" font-family="Arial" font-size="11" fill="#C5A55A" text-anchor="middle">Card must be presented for discount.</text>
    <text x="${w/2}" y="392" font-family="Arial" font-size="11" fill="#C5A55A" text-anchor="middle">Not good with any other offer.</text>

    <!-- Current deals -->
    <rect x="40" y="415" width="${w-80}" height="55" rx="8" fill="rgba(255,255,255,0.08)"/>
    <text x="55" y="437" font-family="Arial" font-weight="700" font-size="10" fill="#C5A55A" letter-spacing="1">CURRENT DEALS</text>
    <text x="55" y="456" font-family="Arial" font-size="11" fill="#C5A55A">Game Day: 20% off at Board &amp; Brew tonight!</text>

    <!-- Terms link -->
    <text x="${w/2}" y="500" font-family="Arial" font-size="10" fill="#888" text-anchor="middle">By adding this card you agree to the Terms &amp; Conditions</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, "claim-page-mockup.png"));
  console.log("  claim-page-mockup.png");
}

async function main() {
  console.log("Rendering mockup images...\n");
  await renderWalletPass();
  await renderScanVerification();
  await renderFraudWarning();
  await renderSponsorDashboard();
  await renderClaimPage();
  console.log(`\nDone! ${fs.readdirSync(OUT).length} images in ${OUT}`);
}

main().catch(console.error);
