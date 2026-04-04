/**
 * SpotOn POS Integration
 *
 * SpotOn is an all-in-one restaurant platform popular in the US.
 * Location-centric API structure.
 *
 * Required from each SpotOn business:
 * - SpotOn API Key
 * - Location ID
 *
 * SpotOn API docs: https://developer.spoton.com/
 */

const SPOTON_API_URL = process.env.SPOTON_API_URL || "https://api.spoton.com";

/**
 * Push a discount/comp into SpotOn's system.
 */
async function createDiscount(apiKey, locationId, discountName, percentage) {
  const res = await fetch(`${SPOTON_API_URL}/v1/locations/${locationId}/discounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      name: discountName || "Nighthawk Discount Card",
      type: "percentage",
      value: percentage || 10,
      active: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`SpotOn create discount failed: ${res.status} ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Validate a card scan at a SpotOn business.
 */
async function validateForSpotOn(config, cardId, cardValid) {
  if (!cardValid) {
    return { success: false, error: "Card is not valid" };
  }

  return {
    success: true,
    pos: "spoton",
    cardId,
    discountName: config.discountName || "Nighthawk Discount Card",
    message: `Apply "${config.discountName || "Nighthawk Discount Card"}" on SpotOn`,
  };
}

module.exports = {
  createDiscount,
  validateForSpotOn,
};
