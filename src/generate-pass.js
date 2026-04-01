const { PKPass } = require("passkit-generator");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { insertCard } = require("./database");

const CERTS_DIR = path.resolve(__dirname, "../certs");
const MODEL_DIR = path.resolve(__dirname, "../models/discount-card.pass");

// Base URL for QR code verification — update this for production
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function generateCardId() {
  // 8-char alphanumeric ID, uppercase, easy to read/type
  return "DN-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function loadCertificates() {
  return {
    wwdr: fs.readFileSync(path.join(CERTS_DIR, "wwdr.pem")),
    signerCert: fs.readFileSync(path.join(CERTS_DIR, "signerCert.pem")),
    signerKey: fs.readFileSync(path.join(CERTS_DIR, "signerKey.pem")),
  };
}

async function generatePass(options = {}) {
  const {
    holderName = null,
    validFrom = "2026-07-31",
    validThru = "07/31/2027",
    cardValue = "$20",
  } = options;

  const certificates = loadCertificates();
  const serialNumber = crypto.randomUUID();
  const cardId = generateCardId();

  // Register the card in the database
  insertCard.run(cardId, serialNumber, holderName, validFrom, "2027-07-31");

  // QR code points to a verification/scan URL
  const qrUrl = `${BASE_URL}/scan/${cardId}`;

  const pass = await PKPass.from(
    {
      model: MODEL_DIR,
      certificates,
    },
    {
      serialNumber,
      description: "Del Norte Nighthawk Discount Card",
      generic: {
        primaryFields: [
          {
            key: "cardType",
            label: "NIGHTHAWK",
            value: "DISCOUNT CARD",
          },
        ],
        secondaryFields: [
          {
            key: "value",
            label: "VALUE",
            value: cardValue,
          },
          {
            key: "validThru",
            label: "VALID THRU",
            value: validThru,
          },
        ],
        auxiliaryFields: [
          {
            key: "cardId",
            label: "CARD ID",
            value: cardId,
          },
          {
            key: "school",
            label: "SCHOOL",
            value: "Del Norte HS Football",
          },
        ],
      },
    }
  );

  // QR code encodes the scan URL — when a business scans it,
  // it opens the browser to log the scan and show card validity
  pass.setBarcodes({
    message: qrUrl,
    format: "PKBarcodeFormatQR",
    messageEncoding: "iso-8859-1",
    altText: cardId,
  });

  return { buffer: await pass.getAsBuffer(), cardId };
}

module.exports = { generatePass, generateCardId };
