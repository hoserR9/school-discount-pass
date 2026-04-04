/**
 * POS Integration Router
 *
 * Routes card scans to the correct POS integration based on
 * the business's configured POS type.
 *
 * Supported POS systems:
 * - toast     — Toast POS (restaurant)
 * - square    — Square POS (multi-purpose)
 * - clover    — Clover POS (quick-service, retail)
 * - shopify   — Shopify POS (retail, omnichannel)
 * - revel     — Revel POS (iPad restaurant)
 * - spoton    — SpotOn POS (restaurant)
 * - heartland — Heartland POS (restaurant, retail)
 * - manual    — No POS integration (cashier applies manually)
 */

const { validateForToast } = require("./toast");
const { validateForSquare } = require("./square");
const { validateForClover } = require("./clover");
const { validateForShopify } = require("./shopify");
const { validateForRevel } = require("./revel");
const { validateForSpotOn } = require("./spoton");
const { validateForHeartland } = require("./heartland");

/**
 * Validate a card scan and return POS-specific instructions.
 *
 * @param {string} posType - The POS system type (toast, square, clover, etc.)
 * @param {object} config - POS-specific configuration (API keys, merchant IDs, etc.)
 * @param {string} cardId - The card ID being scanned
 * @param {string} holderName - Cardholder name (if available)
 * @param {boolean} cardValid - Whether the card is currently valid
 * @returns {object} - POS-specific response with instructions
 */
async function validateForPOS(posType, config, cardId, holderName, cardValid) {
  switch (posType) {
    case "toast":
      return validateForToast(config, cardId, cardValid);

    case "square":
      return validateForSquare(config, cardId, holderName, cardValid);

    case "clover":
      return validateForClover(config, cardId, cardValid);

    case "shopify":
      return validateForShopify(config, cardId, cardValid);

    case "revel":
      return validateForRevel(config, cardId, cardValid);

    case "spoton":
      return validateForSpotOn(config, cardId, cardValid);

    case "heartland":
      return validateForHeartland(config, cardId, cardValid);

    case "manual":
    default:
      return {
        success: cardValid,
        pos: "manual",
        cardId,
        holder: holderName,
        message: cardValid
          ? "Card is valid. Apply discount manually."
          : "Card is NOT valid. Do not apply discount.",
      };
  }
}

/**
 * List all supported POS types with their display names.
 */
function getSupportedPOSTypes() {
  return [
    { value: "manual", label: "Manual (no POS integration)", description: "Cashier verifies card and applies discount manually" },
    { value: "toast", label: "Toast", description: "Auto-apply via Toast promo codes" },
    { value: "square", label: "Square", description: "Customer identification + catalog discount" },
    { value: "clover", label: "Clover", description: "REST API discount application" },
    { value: "shopify", label: "Shopify POS", description: "Discount code via Shopify admin" },
    { value: "revel", label: "Revel", description: "Barcode-scannable coupon" },
    { value: "spoton", label: "SpotOn", description: "Location-based discount push" },
    { value: "heartland", label: "Heartland", description: "Barcode or typed coupon code" },
  ];
}

module.exports = {
  validateForPOS,
  getSupportedPOSTypes,
};
