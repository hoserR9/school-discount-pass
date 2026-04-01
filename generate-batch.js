#!/usr/bin/env node
/**
 * Batch Card Generator
 *
 * Pre-generates physical discount cards with unique QR codes.
 * Each card gets a unique ID in the database and a QR code PNG
 * that can be printed on the physical card.
 *
 * Usage:
 *   node generate-batch.js --count 200
 *   node generate-batch.js --count 50 --base-url https://yourserver.com
 *
 * Output:
 *   output/batch-YYYY-MM-DD/
 *   ├── qr-codes/          # Individual QR code PNGs (300dpi)
 *   │   ├── DN-8F3A2B1C.png
 *   │   ├── DN-4D7E9F01.png
 *   │   └── ...
 *   ├── card-backs/         # Print-ready card backs with QR embedded
 *   │   ├── DN-8F3A2B1C.png
 *   │   ├── DN-4D7E9F01.png
 *   │   └── ...
 *   ├── manifest.csv        # Card ID list for records
 *   └── summary.txt         # Batch summary
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const QRCode = require("qrcode");
const sharp = require("sharp");

// Parse args
const args = process.argv.slice(2);
const countIdx = args.indexOf("--count");
const urlIdx = args.indexOf("--base-url");
const count = countIdx >= 0 ? parseInt(args[countIdx + 1]) : 10;
const BASE_URL = urlIdx >= 0 ? args[urlIdx + 1] : (process.env.BASE_URL || "http://localhost:3000");

if (isNaN(count) || count < 1 || count > 1000) {
  console.error("Usage: node generate-batch.js --count <1-1000> [--base-url <url>]");
  process.exit(1);
}

// Import database (this creates the DB if it doesn't exist)
const { insertCard } = require("./src/database");

function generateCardId() {
  return "DN-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function generateAuthToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function generateQRCode(url, size = 400) {
  return QRCode.toBuffer(url, {
    type: "png",
    width: size,
    margin: 2,
    color: { dark: "#002D62", light: "#FFFFFF" },
    errorCorrectionLevel: "H", // High — survives 30% damage (good for printed cards)
  });
}

async function generateCardBackWithQR(cardId, qrBuffer) {
  // Create the card back as a composited image (1050x600 at 300dpi = 3.5"x2")
  const width = 1050;
  const height = 600;

  // Read the base card-back SVG and convert to PNG
  const baseSvgPath = path.resolve(__dirname, "design/card-back.svg");
  let basePng;

  if (fs.existsSync(baseSvgPath)) {
    basePng = await sharp(baseSvgPath).resize(width, height).png().toBuffer();
  } else {
    // Fallback: white card with navy border
    basePng = await sharp({
      create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    }).png().toBuffer();
  }

  // Resize QR code for the card
  const qrSize = 160;
  const qrResized = await sharp(qrBuffer).resize(qrSize, qrSize).png().toBuffer();

  // Composite QR code onto card back (bottom-right area)
  const result = await sharp(basePng)
    .composite([
      { input: qrResized, left: width - qrSize - 70, top: height - qrSize - 50 },
    ])
    .png()
    .toBuffer();

  return result;
}

async function main() {
  const timestamp = new Date().toISOString().split("T")[0];
  const batchDir = path.resolve(__dirname, `output/batch-${timestamp}`);
  const qrDir = path.join(batchDir, "qr-codes");
  const cardDir = path.join(batchDir, "card-backs");

  fs.mkdirSync(qrDir, { recursive: true });
  fs.mkdirSync(cardDir, { recursive: true });

  console.log(`\nGenerating ${count} cards...`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${batchDir}\n`);

  const cards = [];
  const csvLines = ["card_id,serial_number,qr_url,created"];

  for (let i = 0; i < count; i++) {
    const cardId = generateCardId();
    const serialNumber = crypto.randomUUID();
    const authToken = generateAuthToken();
    const qrUrl = `${BASE_URL}/card/${cardId}`;

    // Insert into database (unclaimed by default)
    insertCard.run(cardId, serialNumber, authToken, null, "2026-07-31", "2027-07-31");

    // Generate QR code
    const qrBuffer = await generateQRCode(qrUrl);
    fs.writeFileSync(path.join(qrDir, `${cardId}.png`), qrBuffer);

    // Generate card back with QR
    const cardBack = await generateCardBackWithQR(cardId, qrBuffer);
    fs.writeFileSync(path.join(cardDir, `${cardId}.png`), cardBack);

    cards.push({ cardId, serialNumber, qrUrl });
    csvLines.push(`${cardId},${serialNumber},${qrUrl},${new Date().toISOString()}`);

    // Progress
    if ((i + 1) % 10 === 0 || i === count - 1) {
      process.stdout.write(`\r  Generated ${i + 1}/${count} cards`);
    }
  }

  console.log("\n");

  // Write manifest
  fs.writeFileSync(path.join(batchDir, "manifest.csv"), csvLines.join("\n"));

  // Write summary
  const summary = [
    `Del Norte Nighthawk Discount Card — Batch Generation`,
    `====================================================`,
    `Date: ${new Date().toISOString()}`,
    `Cards Generated: ${count}`,
    `Base URL: ${BASE_URL}`,
    ``,
    `Card IDs:`,
    ...cards.map((c, i) => `  ${i + 1}. ${c.cardId} → ${c.qrUrl}`),
    ``,
    `Files:`,
    `  qr-codes/    — Individual QR code PNGs (use these standalone)`,
    `  card-backs/  — Print-ready card backs with QR embedded`,
    `  manifest.csv — Full card list with serial numbers`,
    ``,
    `Next Steps:`,
    `  1. Send card-backs/ to your print shop`,
    `  2. Or import QR codes into Canva and place on your own card design`,
    `  3. Deploy the server so ${BASE_URL} is publicly accessible`,
    `  4. When someone scans a QR code, they'll see the claim page`,
  ].join("\n");

  fs.writeFileSync(path.join(batchDir, "summary.txt"), summary);

  console.log(`Done! Output in: ${batchDir}`);
  console.log(`  ${count} QR codes in qr-codes/`);
  console.log(`  ${count} card backs in card-backs/`);
  console.log(`  Manifest: manifest.csv`);
  console.log(`\nAll ${count} cards are registered in the database as unclaimed.`);
  console.log(`When someone scans a QR code, they can claim it and add to Apple Wallet.\n`);
}

main().catch(console.error);
