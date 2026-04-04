/**
 * Square POS Integration
 *
 * Allows the Nighthawk discount card to work with businesses using Square POS.
 *
 * How it works:
 * 1. Admin configures the business with their Square access token
 * 2. We pre-create a "Nighthawk Discount" in their Square catalog
 * 3. When a card is scanned, we return the discount info for the cashier
 * 4. Square can auto-apply discounts via the Catalog API pricing rules
 *
 * Required from each Square business:
 * - Square Access Token (from their Square Developer dashboard)
 * - Location ID
 *
 * Square API docs:
 * - Catalog API: https://developer.squareup.com/reference/square/catalog-api
 * - Customers API: https://developer.squareup.com/reference/square/customers-api
 *
 * Environment variables (global):
 *   SQUARE_API_URL — defaults to sandbox (https://connect.squareupsandbox.com)
 *   Set to https://connect.squareup.com for production
 */

const SQUARE_API_URL = process.env.SQUARE_API_URL || "https://connect.squareupsandbox.com";

/**
 * Create or update a "Nighthawk Discount" in the business's Square catalog.
 * This only needs to be done once per business during setup.
 */
async function createCatalogDiscount(accessToken, discountName, discountPercentage) {
  const idempotencyKey = `nighthawk-discount-${Date.now()}`;

  const res = await fetch(`${SQUARE_API_URL}/v2/catalog/object`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": "2024-01-18",
    },
    body: JSON.stringify({
      idempotency_key: idempotencyKey,
      object: {
        type: "DISCOUNT",
        id: "#nighthawk-discount",
        discount_data: {
          name: discountName || "Nighthawk Discount Card",
          discount_type: "FIXED_PERCENTAGE",
          percentage: String(discountPercentage || 10),
          modify_tax_basis: "MODIFY_TAX_BASIS",
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Square create discount failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return {
    success: true,
    catalogObjectId: data.catalog_object?.id,
    discount: data.catalog_object?.discount_data,
  };
}

/**
 * Look up or create a customer in Square for a cardholder.
 * This allows Square to track Nighthawk cardholders as customers.
 */
async function findOrCreateCustomer(accessToken, cardId, holderName) {
  // Search for existing customer by reference (card ID)
  const searchRes = await fetch(`${SQUARE_API_URL}/v2/customers/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": "2024-01-18",
    },
    body: JSON.stringify({
      query: {
        filter: {
          reference_id: { exact: cardId },
        },
      },
    }),
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.customers && searchData.customers.length > 0) {
      return { customerId: searchData.customers[0].id, created: false };
    }
  }

  // Create new customer
  const createRes = await fetch(`${SQUARE_API_URL}/v2/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": "2024-01-18",
    },
    body: JSON.stringify({
      idempotency_key: `nighthawk-customer-${cardId}`,
      given_name: holderName || "Nighthawk Cardholder",
      reference_id: cardId,
      note: `Del Norte Nighthawk Discount Card — ${cardId}`,
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Square create customer failed: ${createRes.status}`);
  }

  const createData = await createRes.json();
  return { customerId: createData.customer?.id, created: true };
}

/**
 * List locations for a Square business.
 * Needed during setup to find the correct location ID.
 */
async function listLocations(accessToken) {
  const res = await fetch(`${SQUARE_API_URL}/v2/locations`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": "2024-01-18",
    },
  });

  if (!res.ok) {
    throw new Error(`Square list locations failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.locations || []).map((l) => ({
    id: l.id,
    name: l.name,
    address: l.address?.address_line_1,
    status: l.status,
  }));
}

/**
 * Validate a card scan at a Square business.
 * Returns structured data for the POS.
 */
async function validateForSquare(config, cardId, holderName, cardValid) {
  if (!cardValid) {
    return { success: false, error: "Card is not valid" };
  }

  try {
    // Identify/create the customer in Square
    const customer = await findOrCreateCustomer(config.accessToken, cardId, holderName);

    return {
      success: true,
      pos: "square",
      cardId,
      customerId: customer.customerId,
      discountName: config.discountName || "Nighthawk Discount Card",
      discountPercentage: config.discountPercentage || "10",
      message: `Customer identified. Apply "${config.discountName || "Nighthawk Discount Card"}" discount.`,
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
  createCatalogDiscount,
  findOrCreateCustomer,
  listLocations,
  validateForSquare,
};
