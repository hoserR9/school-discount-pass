const express = require("express");
const path = require("path");
const { generatePass, PASS_TYPE_ID } = require("./src/generate-pass");
const {
  getCard,
  getCardBySerial,
  getCardByAuthToken,
  touchCardUpdated,
  logScan,
  getScansForCard,
  getAllCards,
  getUsageStats,
  deactivateCard,
  registerDevice,
  unregisterDevice,
  getSerialsForDevice,
  getRegistrationCount,
  createPromotion,
  getActivePromotions,
  getAllPromotions,
  deactivatePromotion,
} = require("./src/database");
const { pushUpdateToAll } = require("./src/push-update");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ═══════════════════════════════════════════════
//  PASS GENERATION
// ═══════════════════════════════════════════════

app.get("/pass", async (req, res) => {
  try {
    const holderName = req.query.name || null;
    const { buffer, cardId } = await generatePass({ holderName });

    console.log(`[ISSUED] Card ${cardId} ${holderName ? `for ${holderName}` : ""}`);

    res.set({
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": 'attachment; filename="del-norte-nighthawk-discount.pkpass"',
    });
    res.send(buffer);
  } catch (err) {
    console.error("Error generating pass:", err);
    res.status(500).json({ error: "Failed to generate pass", details: err.message });
  }
});

// ═══════════════════════════════════════════════
//  QR CODE SCAN ENDPOINT
// ═══════════════════════════════════════════════

app.get("/scan/:cardId", (req, res) => {
  const { cardId } = req.params;
  const businessName = req.query.biz || null;
  const card = getCard.get(cardId);

  if (!card) {
    return res.status(404).send(renderScanPage(null, cardId));
  }

  logScan.run(cardId, businessName, req.ip, req.get("user-agent") || "");
  const scans = getScansForCard.all(cardId);

  console.log(`[SCAN] Card ${cardId} scanned${businessName ? ` at ${businessName}` : ""} (total: ${scans.length})`);

  res.send(renderScanPage(card, cardId, scans));
});

// ═══════════════════════════════════════════════
//  APPLE WALLET WEB SERVICE ENDPOINTS
//  These are called by Apple Wallet automatically
//  when a pass has a webServiceURL configured.
// ═══════════════════════════════════════════════

/**
 * Validate the Authorization header from Apple Wallet.
 * Apple sends: "ApplePass <authenticationToken>"
 */
function validateAuth(req) {
  const authHeader = req.get("Authorization");
  if (!authHeader || !authHeader.startsWith("ApplePass ")) {
    return null;
  }
  const token = authHeader.substring("ApplePass ".length);
  return getCardByAuthToken.get(token);
}

/**
 * POST /v1/devices/:deviceId/registrations/:passTypeId/:serialNumber
 * Called when a user adds the pass to their Wallet.
 * Apple sends the device's push token so we can send updates later.
 */
app.post("/v1/devices/:deviceId/registrations/:passTypeId/:serialNumber", (req, res) => {
  const { deviceId, passTypeId, serialNumber } = req.params;
  const card = validateAuth(req);

  if (!card) {
    console.log(`[REGISTER] Auth failed for ${serialNumber}`);
    return res.sendStatus(401);
  }

  const pushToken = req.body.pushToken;
  if (!pushToken) {
    return res.sendStatus(400);
  }

  registerDevice.run(deviceId, pushToken, serialNumber, passTypeId);
  console.log(`[REGISTER] Device ${deviceId.substring(0, 8)}... registered for pass ${serialNumber.substring(0, 8)}...`);

  res.sendStatus(201);
});

/**
 * GET /v1/devices/:deviceId/registrations/:passTypeId
 * Called by Apple to get the list of passes registered on this device.
 * Optional query param: passesUpdatedSince (ISO timestamp)
 */
app.get("/v1/devices/:deviceId/registrations/:passTypeId", (req, res) => {
  const { deviceId, passTypeId } = req.params;
  const serials = getSerialsForDevice.all(deviceId, passTypeId);

  if (serials.length === 0) {
    return res.sendStatus(204);
  }

  const serialNumbers = serials.map((s) => s.serial_number);

  // If passesUpdatedSince is provided, filter to only updated passes
  const since = req.query.passesUpdatedSince;
  let filteredSerials = serialNumbers;
  if (since) {
    filteredSerials = serialNumbers.filter((sn) => {
      const card = getCardBySerial.get(sn);
      return card && card.last_updated > since;
    });
    if (filteredSerials.length === 0) {
      return res.sendStatus(204);
    }
  }

  res.json({
    serialNumbers: filteredSerials,
    lastUpdated: new Date().toISOString(),
  });
});

/**
 * GET /v1/passes/:passTypeId/:serialNumber
 * Called by Apple Wallet to download the latest version of a pass.
 * This is where the magic happens — the updated pass (with new promotions, etc.)
 * gets delivered to the user's device.
 */
app.get("/v1/passes/:passTypeId/:serialNumber", async (req, res) => {
  const { serialNumber } = req.params;
  const card = validateAuth(req);

  if (!card) {
    return res.sendStatus(401);
  }

  // Check If-Modified-Since header — skip if pass hasn't changed
  const ifModifiedSince = req.get("If-Modified-Since");
  if (ifModifiedSince && card.last_updated) {
    const clientDate = new Date(ifModifiedSince);
    const serverDate = new Date(card.last_updated);
    if (serverDate <= clientDate) {
      return res.sendStatus(304);
    }
  }

  try {
    // Regenerate the pass with current promotions baked in
    const { buffer } = await generatePass({
      existingCardId: card.card_id,
      existingSerialNumber: card.serial_number,
      existingAuthToken: card.auth_token,
      holderName: card.holder_name,
    });

    res.set({
      "Content-Type": "application/vnd.apple.pkpass",
      "Last-Modified": new Date(card.last_updated || Date.now()).toUTCString(),
    });
    res.send(buffer);

    console.log(`[UPDATE] Served updated pass for ${card.card_id}`);
  } catch (err) {
    console.error("Error regenerating pass:", err);
    res.sendStatus(500);
  }
});

/**
 * DELETE /v1/devices/:deviceId/registrations/:passTypeId/:serialNumber
 * Called when a user removes the pass from their Wallet.
 */
app.delete("/v1/devices/:deviceId/registrations/:passTypeId/:serialNumber", (req, res) => {
  const { deviceId, passTypeId, serialNumber } = req.params;
  const card = validateAuth(req);

  if (!card) {
    return res.sendStatus(401);
  }

  unregisterDevice.run(deviceId, serialNumber, passTypeId);
  console.log(`[UNREGISTER] Device ${deviceId.substring(0, 8)}... removed pass ${serialNumber.substring(0, 8)}...`);

  res.sendStatus(200);
});

/**
 * POST /v1/log
 * Apple Wallet sends error logs here (optional, but useful for debugging).
 */
app.post("/v1/log", (req, res) => {
  if (req.body && req.body.logs) {
    req.body.logs.forEach((log) => console.log(`[WALLET LOG] ${log}`));
  }
  res.sendStatus(200);
});

// ═══════════════════════════════════════════════
//  PROMOTIONS API
// ═══════════════════════════════════════════════

app.get("/api/promotions", (req, res) => {
  const promotions = getAllPromotions.all();
  res.json(promotions);
});

app.get("/api/promotions/active", (req, res) => {
  const promotions = getActivePromotions.all();
  res.json(promotions);
});

app.post("/api/promotions", (req, res) => {
  const { title, message, fieldKey, fieldValue, activeFrom, activeUntil } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "title and message are required" });
  }

  const result = createPromotion.run(
    title,
    message,
    fieldKey || null,
    fieldValue || null,
    activeFrom || new Date().toISOString(),
    activeUntil || null
  );

  console.log(`[PROMO] Created promotion #${result.lastInsertRowid}: "${title}"`);

  res.json({ success: true, id: Number(result.lastInsertRowid) });
});

app.post("/api/promotions/:id/deactivate", (req, res) => {
  deactivatePromotion.run(req.params.id);
  console.log(`[PROMO] Deactivated promotion #${req.params.id}`);
  res.json({ success: true });
});

/**
 * POST /api/push
 * Trigger a push update to all registered devices.
 * This tells every iPhone with the card to fetch the latest version,
 * which will include any active promotions.
 */
app.post("/api/push", async (req, res) => {
  console.log("[PUSH] Triggering push update to all registered devices...");

  // Touch all cards' last_updated timestamp
  const cards = getAllCards.all();
  cards.forEach((c) => {
    const cardDetail = getCardBySerial.get ? getCard.get(c.card_id) : null;
    if (cardDetail) {
      touchCardUpdated.run(cardDetail.serial_number);
    }
  });

  const result = await pushUpdateToAll();
  console.log(`[PUSH] Result: ${result.message}`);

  res.json(result);
});

// ═══════════════════════════════════════════════
//  ADMIN DASHBOARD & API
// ═══════════════════════════════════════════════

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/api/cards", (req, res) => {
  const cards = getAllCards.all();
  res.json(cards);
});

app.get("/api/cards/:cardId/scans", (req, res) => {
  const scans = getScansForCard.all(req.params.cardId);
  res.json(scans);
});

app.get("/api/stats", (req, res) => {
  const stats = getUsageStats.all();
  const cards = getAllCards.all();
  const regCount = getRegistrationCount.get();
  res.json({
    totalCards: cards.length,
    activeCards: cards.filter((c) => c.is_active).length,
    totalScans: cards.reduce((sum, c) => sum + c.scan_count, 0),
    registeredDevices: regCount ? regCount.count : 0,
    byBusiness: stats,
  });
});

app.post("/api/cards/:cardId/deactivate", (req, res) => {
  deactivateCard.run(req.params.cardId);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════
//  SCAN RESULT PAGE HTML
// ═══════════════════════════════════════════════

function renderScanPage(card, cardId, scans = []) {
  if (!card) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Invalid Card</title>
    <style>body{font-family:-apple-system,sans-serif;background:#cc0000;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}
    .box{background:rgba(0,0,0,0.3);border-radius:16px;padding:40px;max-width:360px}</style></head>
    <body><div class="box"><h1>INVALID CARD</h1><p>Card ID <strong>${cardId}</strong> was not found.</p></div></body></html>`;
  }

  const isActive = card.is_active;
  const now = new Date();
  const validThru = new Date(card.valid_thru);
  const isExpired = now > validThru;
  const isValid = isActive && !isExpired;

  const statusColor = isValid ? "#1a7a1a" : "#cc0000";
  const statusText = !isActive ? "DEACTIVATED" : isExpired ? "EXPIRED" : "VALID";
  const statusEmoji = isValid ? "&#10003;" : "&#10007;";

  // Show active promotions on the scan page too
  const promos = getActivePromotions.all();
  const promoHtml = promos.length > 0
    ? `<div class="scan-count" style="margin-top:12px"><strong>Current Promotions:</strong><br>${promos.map(p => `${p.title}: ${p.message}`).join("<br>")}</div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Del Norte Nighthawk Card — ${statusText}</title>
  <style>
    body{font-family:-apple-system,sans-serif;background:${statusColor};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;text-align:center}
    .card{background:rgba(0,0,0,0.2);border-radius:16px;padding:30px;max-width:360px;width:100%}
    .status{font-size:64px;margin-bottom:8px}
    h1{font-size:24px;margin:0 0 4px}
    h2{font-size:16px;font-weight:400;margin:0 0 20px;opacity:0.8}
    .detail{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2);font-size:14px}
    .detail:last-child{border-bottom:none}
    .label{opacity:0.7}
    .scan-count{background:rgba(255,255,255,0.2);border-radius:8px;padding:12px;margin-top:16px;font-size:13px}
  </style></head>
  <body>
    <div class="card">
      <div class="status">${statusEmoji}</div>
      <h1>DEL NORTE NIGHTHAWK</h1>
      <h2>Discount Card — ${statusText}</h2>
      <div class="detail"><span class="label">Card ID</span><span>${cardId}</span></div>
      <div class="detail"><span class="label">Holder</span><span>${card.holder_name || "General"}</span></div>
      <div class="detail"><span class="label">Issued</span><span>${card.issued_at}</span></div>
      <div class="detail"><span class="label">Valid Thru</span><span>${card.valid_thru}</span></div>
      <div class="scan-count">This card has been scanned <strong>${scans.length}</strong> time${scans.length !== 1 ? "s" : ""}</div>
      ${promoHtml}
    </div>
  </body></html>`;
}

app.listen(PORT, () => {
  console.log(`Del Norte Nighthawk Discount Pass server running at http://localhost:${PORT}`);
  console.log(`Download a pass:  http://localhost:${PORT}/pass`);
  console.log(`Admin dashboard:  http://localhost:${PORT}/admin`);
  console.log(`\nApple Wallet web service endpoints active at /v1/...`);
});
