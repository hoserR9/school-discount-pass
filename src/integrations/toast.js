/**
 * Toast POS Integration
 *
 * Allows the Nighthawk discount card to auto-apply discounts
 * at businesses using Toast POS.
 *
 * How it works:
 * 1. Admin configures the business in the dashboard with their Toast credentials
 * 2. When a card is scanned at that business, we call Toast's API to apply the discount
 * 3. Toast shows the discount on the cashier's screen automatically
 *
 * Required from each Toast business:
 * - Toast API Client ID
 * - Toast API Client Secret
 * - Restaurant GUID
 * - Pre-configured promo code name in their Toast dashboard
 *
 * Toast API docs: https://doc.toasttab.com/doc/devguide/apiDiscountingOrders.html
 *
 * Environment variables (global):
 *   TOAST_API_URL — defaults to sandbox (https://ws-sandbox-api.eng.toasttab.com)
 *   Set to https://ws-api.toasttab.com for production
 */

const TOAST_API_URL = process.env.TOAST_API_URL || "https://ws-sandbox-api.eng.toasttab.com";

/**
 * Get a Toast authentication token.
 * Toast uses OAuth2 client_credentials flow.
 */
async function getToastToken(clientId, clientSecret) {
  const res = await fetch(`${TOAST_API_URL}/authentication/v1/authentication/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId,
      clientSecret,
      userAccessType: "TOAST_MACHINE_CLIENT",
    }),
  });

  if (!res.ok) {
    throw new Error(`Toast auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.token?.accessToken || data.accessToken;
}

/**
 * Check if a promo code / discount is applicable to an order.
 * This is optional — Toast doesn't verify promo codes server-side,
 * but we can use it to confirm the discount exists.
 */
async function checkDiscount(token, restaurantGuid, promoCode) {
  const res = await fetch(
    `${TOAST_API_URL}/orders/v2/restaurants/${restaurantGuid}/applicableDiscounts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Toast-Restaurant-External-ID": restaurantGuid,
      },
      body: JSON.stringify({ promoCode }),
    }
  );

  if (!res.ok) {
    return { valid: false, error: `Toast API error: ${res.status}` };
  }

  const data = await res.json();
  return { valid: true, discounts: data };
}

/**
 * Apply a discount to an existing Toast order.
 * In practice, the cashier would scan the card, and this would
 * add the Nighthawk discount to their current open check.
 *
 * Note: This requires the order GUID, which the POS integration
 * would need to provide. For most use cases, the cashier will
 * apply the promo code manually after scanning the card.
 */
async function applyDiscountToOrder(token, restaurantGuid, orderGuid, promoCode, discountName) {
  const res = await fetch(
    `${TOAST_API_URL}/orders/v2/restaurants/${restaurantGuid}/orders/${orderGuid}/appliedDiscounts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Toast-Restaurant-External-ID": restaurantGuid,
      },
      body: JSON.stringify([
        {
          name: discountName || "Nighthawk Discount",
          appliedPromoCode: promoCode,
          discountAmount: null, // Let Toast use the configured amount
        },
      ]),
    }
  );

  if (!res.ok) {
    throw new Error(`Toast apply discount failed: ${res.status} ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Validate a card scan at a Toast business.
 * Returns structured data the POS can use.
 */
async function validateForToast(config, cardId, cardValid) {
  if (!cardValid) {
    return { success: false, error: "Card is not valid" };
  }

  try {
    const token = await getToastToken(config.clientId, config.clientSecret);

    return {
      success: true,
      pos: "toast",
      cardId,
      promoCode: config.promoCode || "NIGHTHAWK",
      discountName: config.discountName || "Nighthawk Discount",
      message: `Apply promo code "${config.promoCode || "NIGHTHAWK"}" on Toast`,
      // The token can be used if the POS wants to auto-apply
      _token: token,
      _restaurantGuid: config.restaurantGuid,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      fallback: "Apply discount manually",
    };
  }
}

module.exports = {
  getToastToken,
  checkDiscount,
  applyDiscountToOrder,
  validateForToast,
};
