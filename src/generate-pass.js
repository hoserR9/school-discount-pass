const { PKPass } = require("passkit-generator");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { insertCard, getActivePromotions } = require("./database");

const CERTS_DIR = path.resolve(__dirname, "../certs");
const MODEL_DIR = path.resolve(__dirname, "../models/discount-card.pass");

// Base URL for QR code verification and web service — update for production
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const PASS_TYPE_ID = "pass.com.delnorte.football.discount";

function generateCardId() {
  return "DN-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function generateAuthToken() {
  // Apple requires minimum 16 characters
  return crypto.randomBytes(32).toString("hex");
}

function loadCertificates() {
  return {
    wwdr: fs.readFileSync(path.join(CERTS_DIR, "wwdr.pem")),
    signerCert: fs.readFileSync(path.join(CERTS_DIR, "signerCert.pem")),
    signerKey: fs.readFileSync(path.join(CERTS_DIR, "signerKey.pem")),
  };
}

/**
 * Build the back-fields content, merging active promotions into the pass.
 */
function buildBackFields() {
  const backFields = [
    {
      key: "instructions",
      label: "CARD MUST BE PRESENTED FOR DISCOUNT",
      value:
        "Option 1: Have the cashier SCAN the QR code on this card.\nOption 2: Simply show this card on your phone — the cashier verifies and applies the discount.\n\nYou must have the card (physical or digital) to receive the discount.",
    },
    {
      key: "businesses",
      label: "PARTICIPATING BUSINESSES",
      value: [
        "Baskin Robbins — BOGO 50% off scoops",
        "Harland Brewing — 10% off",
        "Board & Brew — 10% off",
        "L&L Hawaiian Barbecue — 10% off",
        "Kahoots — 20% off treats & bones",
        "Mostra Coffee — 10% off",
        "Rosinas — 10% off",
        "Donut Touch — 10% off",
        "Sushi Ren — 20% off, dine-in/carry out",
        "Flippin Pizza — $5 off orders over $15, 1 per customer",
        "Round Table Pizza (Rancho Bernardo) — 10% off",
      ].join("\n"),
    },
    {
      key: "terms",
      label: "IMPORTANT",
      value:
        "NOT GOOD WITH ANY OTHER OFFER. This discount card is issued by Del Norte High School Football. One discount per transaction unless otherwise noted.",
    },
  ];

  // Inject active promotions
  const promos = getActivePromotions.all();
  if (promos.length > 0) {
    const promoText = promos
      .map((p) => `${p.title}: ${p.message}`)
      .join("\n");

    backFields.splice(1, 0, {
      key: "promotions",
      label: "CURRENT PROMOTIONS",
      value: promoText,
    });
  }

  return backFields;
}

/**
 * Generate a .pkpass buffer.
 * If serialNumber is provided (for updates), reuse existing card data.
 * Otherwise create a new card.
 */
async function generatePass(options = {}) {
  const {
    holderName = null,
    validFrom = "2026-07-31",
    validThru = "07/31/2027",
    cardValue = "$20",
    // For pass updates — reuse existing card data
    existingCardId = null,
    existingSerialNumber = null,
    existingAuthToken = null,
  } = options;

  const certificates = loadCertificates();

  const isUpdate = existingSerialNumber !== null;
  const serialNumber = existingSerialNumber || crypto.randomUUID();
  const cardId = existingCardId || generateCardId();
  const authToken = existingAuthToken || generateAuthToken();

  // Register new card in the database
  if (!isUpdate) {
    insertCard.run(cardId, serialNumber, authToken, holderName, validFrom, "2027-07-31");
  }

  const qrUrl = `${BASE_URL}/scan/${cardId}`;

  const pass = await PKPass.from(
    {
      model: MODEL_DIR,
      certificates,
    },
    {
      serialNumber,
      description: "Del Norte Nighthawk Discount Card",
      webServiceURL: BASE_URL + "/",
      authenticationToken: authToken,
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
        backFields: buildBackFields(),
      },
    }
  );

  // QR code encodes the scan URL
  pass.setBarcodes({
    message: qrUrl,
    format: "PKBarcodeFormatQR",
    messageEncoding: "iso-8859-1",
    altText: cardId,
  });

  return { buffer: await pass.getAsBuffer(), cardId, serialNumber, authToken };
}

module.exports = { generatePass, generateCardId, PASS_TYPE_ID };
