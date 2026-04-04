/**
 * Clover POS Integration
 *
 * Clover is popular with quick-service restaurants and small retail.
 * Has a mature REST API for creating and applying discounts.
 *
 * Required from each Clover business:
 * - Merchant ID (mId)
 * - API Access Token (OAuth)
 *
 * Clover API docs: https://docs.clover.com/reference/api-reference-overview
 *
 * Environment variables (global):
 *   CLOVER_API_URL — defaults to sandbox
 *   Set to https://api.clover.com for production
 */

const CLOVER_API_URL = process.env.CLOVER_API_URL || "https://sandbox.dev.clover.com";

/**
 * Create a "Nighthawk Discount" in the merchant's Clover account.
 * Only needs to be done once per business during setup.
 */
async function createDiscount(accessToken, merchantId, discountName, percentage) {
  const res = await fetch(`${CLOVER_API_URL}/v3/merchants/${merchantId}/discounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: discountName || "Nighthawk Discount Card",
      percentage: percentage || 10,
    }),
  });

  if (!res.ok) {
    throw new Error(`Clover create discount failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return { success: true, discountId: data.id, name: data.name };
}

/**
 * List existing discounts for a merchant.
 * Useful to check if Nighthawk discount already exists.
 */
async function listDiscounts(accessToken, merchantId) {
  const res = await fetch(`${CLOVER_API_URL}/v3/merchants/${merchantId}/discounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Clover list discounts failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.elements || []).map((d) => ({
    id: d.id,
    name: d.name,
    percentage: d.percentage,
    amount: d.amount,
  }));
}

/**
 * Apply a discount to an order.
 * Requires the order ID from the current open order on the Clover terminal.
 */
async function applyDiscountToOrder(accessToken, merchantId, orderId, discountId) {
  const res = await fetch(
    `${CLOVER_API_URL}/v3/merchants/${merchantId}/orders/${orderId}/discounts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ discount: { id: discountId } }),
    }
  );

  if (!res.ok) {
    throw new Error(`Clover apply discount failed: ${res.status} ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Validate a card scan at a Clover business.
 */
async function validateForClover(config, cardId, cardValid) {
  if (!cardValid) {
    return { success: false, error: "Card is not valid" };
  }

  return {
    success: true,
    pos: "clover",
    cardId,
    discountId: config.discountId,
    discountName: config.discountName || "Nighthawk Discount Card",
    message: `Apply "${config.discountName || "Nighthawk Discount Card"}" on Clover`,
  };
}

module.exports = {
  createDiscount,
  listDiscounts,
  applyDiscountToOrder,
  validateForClover,
};
