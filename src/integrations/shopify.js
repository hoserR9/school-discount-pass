/**
 * Shopify POS Integration
 *
 * Shopify POS supports discount codes natively and has a modern SDK
 * that can apply discounts programmatically.
 *
 * Required from each Shopify business:
 * - Shopify store domain (e.g., mystore.myshopify.com)
 * - Admin API Access Token
 *
 * Shopify API docs: https://shopify.dev/docs/api/admin-rest
 */

/**
 * Create a price rule and discount code in Shopify.
 * This creates a reusable discount code that the cashier can apply.
 */
async function createDiscountCode(storeDomain, accessToken, discountCode, percentage) {
  // Step 1: Create a price rule
  const priceRuleRes = await fetch(`https://${storeDomain}/admin/api/2024-01/price_rules.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      price_rule: {
        title: discountCode || "NIGHTHAWK",
        target_type: "line_item",
        target_selection: "all",
        allocation_method: "across",
        value_type: "percentage",
        value: `-${percentage || 10}`,
        customer_selection: "all",
        starts_at: new Date().toISOString(),
      },
    }),
  });

  if (!priceRuleRes.ok) {
    throw new Error(`Shopify create price rule failed: ${priceRuleRes.status}`);
  }

  const priceRule = await priceRuleRes.json();
  const priceRuleId = priceRule.price_rule.id;

  // Step 2: Create the discount code under that price rule
  const codeRes = await fetch(
    `https://${storeDomain}/admin/api/2024-01/price_rules/${priceRuleId}/discount_codes.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        discount_code: { code: discountCode || "NIGHTHAWK" },
      }),
    }
  );

  if (!codeRes.ok) {
    throw new Error(`Shopify create discount code failed: ${codeRes.status}`);
  }

  const code = await codeRes.json();
  return {
    success: true,
    priceRuleId,
    discountCodeId: code.discount_code.id,
    code: code.discount_code.code,
  };
}

/**
 * Look up if a discount code exists.
 */
async function lookupDiscountCode(storeDomain, accessToken, code) {
  const res = await fetch(
    `https://${storeDomain}/admin/api/2024-01/discount_codes/lookup.json?code=${encodeURIComponent(code)}`,
    {
      headers: { "X-Shopify-Access-Token": accessToken },
    }
  );

  if (!res.ok) return null;
  return await res.json();
}

/**
 * Validate a card scan at a Shopify POS business.
 */
async function validateForShopify(config, cardId, cardValid) {
  if (!cardValid) {
    return { success: false, error: "Card is not valid" };
  }

  return {
    success: true,
    pos: "shopify",
    cardId,
    discountCode: config.discountCode || "NIGHTHAWK",
    message: `Apply discount code "${config.discountCode || "NIGHTHAWK"}" at Shopify POS`,
  };
}

module.exports = {
  createDiscountCode,
  lookupDiscountCode,
  validateForShopify,
};
