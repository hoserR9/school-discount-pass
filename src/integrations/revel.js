/**
 * Revel POS Integration
 *
 * Revel is an iPad-based POS popular with restaurants.
 * Has an open API with JSON request/response format.
 * Coupons are treated as scannable products via barcode.
 *
 * Required from each Revel business:
 * - Revel API URL (establishment-specific)
 * - API Key + API Secret
 *
 * Revel API docs: https://developer.revelsystems.com/
 */

/**
 * Create a discount/coupon in Revel.
 * Revel treats coupons as products that can be scanned via barcode.
 */
async function createCoupon(apiUrl, apiKey, apiSecret, discountName, discountType, discountValue) {
  const res = await fetch(`${apiUrl}/enterprise/Discount/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "API-AUTHENTICATION": `${apiKey}:${apiSecret}`,
    },
    body: JSON.stringify({
      name: discountName || "Nighthawk Discount Card",
      type: discountType || 1, // 1 = percentage, 0 = fixed amount
      value: discountValue || 10,
      active: true,
      apply_to: 0, // 0 = entire order
    }),
  });

  if (!res.ok) {
    throw new Error(`Revel create coupon failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return { success: true, discountId: data.id, name: data.name };
}

/**
 * List existing discounts.
 */
async function listDiscounts(apiUrl, apiKey, apiSecret) {
  const res = await fetch(`${apiUrl}/enterprise/Discount/?format=json`, {
    headers: { "API-AUTHENTICATION": `${apiKey}:${apiSecret}` },
  });

  if (!res.ok) {
    throw new Error(`Revel list discounts failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.objects || []).map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type === 1 ? "percentage" : "fixed",
    value: d.value,
    active: d.active,
  }));
}

/**
 * Validate a card scan at a Revel business.
 */
async function validateForRevel(config, cardId, cardValid) {
  if (!cardValid) {
    return { success: false, error: "Card is not valid" };
  }

  return {
    success: true,
    pos: "revel",
    cardId,
    discountId: config.discountId,
    discountName: config.discountName || "Nighthawk Discount Card",
    message: `Scan barcode or apply "${config.discountName || "Nighthawk Discount Card"}" on Revel`,
  };
}

module.exports = {
  createCoupon,
  listDiscounts,
  validateForRevel,
};
