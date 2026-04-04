/**
 * Heartland POS Integration
 *
 * Heartland supports coupon codes that can be manually typed or
 * barcode-scanned. Good for retail and restaurant.
 *
 * Required from each Heartland business:
 * - Heartland API Key
 * - Location/Store ID
 *
 * Heartland docs: https://developer.heartland.us/
 */

const HEARTLAND_API_URL = process.env.HEARTLAND_API_URL || "https://api.heartlandretail.us";

/**
 * Create a coupon in Heartland's system.
 * Heartland supports percentage, dollar, fixed price, and BOGO.
 */
async function createCoupon(apiKey, storeId, couponName, discountType, discountValue) {
  const res = await fetch(`${HEARTLAND_API_URL}/api/coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: couponName || "Nighthawk Discount Card",
      code: "NIGHTHAWK",
      discount_type: discountType || "percent", // percent, dollar, fixed_price, bogo
      discount_amount: discountValue || 10,
      store_id: storeId,
      active: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Heartland create coupon failed: ${res.status} ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Validate a card scan at a Heartland business.
 */
async function validateForHeartland(config, cardId, cardValid) {
  if (!cardValid) {
    return { success: false, error: "Card is not valid" };
  }

  return {
    success: true,
    pos: "heartland",
    cardId,
    couponCode: config.couponCode || "NIGHTHAWK",
    discountName: config.discountName || "Nighthawk Discount Card",
    message: `Scan barcode or type coupon code "${config.couponCode || "NIGHTHAWK"}" on Heartland`,
  };
}

module.exports = {
  createCoupon,
  validateForHeartland,
};
