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
  claimCard,
  getUnclaimedCards,
  getClaimStats,
  getSponsorByCode,
  getScansForBusiness,
  getStatsForBusiness,
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
//  SMART CARD ENDPOINT (physical QR → dual purpose)
//  - iPhone user → claim page with "Add to Wallet"
//  - Business POS → verification + logs scan
// ═══════════════════════════════════════════════

app.get("/card/:cardId", (req, res) => {
  const { cardId } = req.params;
  const card = getCard.get(cardId);

  if (!card) {
    return res.status(404).send(renderScanPage(null, cardId));
  }

  // Detect if this is likely a customer (mobile browser) vs a business (POS/desktop)
  const ua = (req.get("user-agent") || "").toLowerCase();
  const isMobile = /iphone|ipad|android|mobile/i.test(ua);

  if (isMobile && !card.is_claimed) {
    // First-time scan on mobile → show claim page with "Add to Apple Wallet"
    console.log(`[CLAIM PAGE] Card ${cardId} — showing claim page`);
    return res.send(renderClaimPage(card, cardId));
  }

  if (isMobile && card.is_claimed) {
    // Already claimed on mobile → show card details + re-download option
    console.log(`[CARD VIEW] Card ${cardId} — already claimed, showing details`);
    return res.send(renderClaimPage(card, cardId, true));
  }

  // Business scan → log it and show verification
  const businessName = req.query.biz || null;
  logScan.run(cardId, businessName, req.ip, req.get("user-agent") || "");
  const scans = getScansForCard.all(cardId);
  console.log(`[SCAN] Card ${cardId} scanned at POS (total: ${scans.length})`);
  res.send(renderScanPage(card, cardId, scans));
});

// Claim endpoint — when user taps "Add to Wallet" from the claim page
app.get("/card/:cardId/claim", async (req, res) => {
  const { cardId } = req.params;
  const holderName = req.query.name || null;
  const card = getCard.get(cardId);

  if (!card) {
    return res.status(404).json({ error: "Card not found" });
  }

  // Mark as claimed
  if (!card.is_claimed) {
    claimCard.run(holderName, cardId);
    console.log(`[CLAIMED] Card ${cardId} claimed${holderName ? ` by ${holderName}` : ""}`);
  }

  // Generate the .pkpass tied to this specific card
  try {
    const { buffer } = await generatePass({
      existingCardId: card.card_id,
      existingSerialNumber: card.serial_number,
      existingAuthToken: card.auth_token,
      holderName: holderName || card.holder_name,
    });

    res.set({
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": 'attachment; filename="del-norte-nighthawk-discount.pkpass"',
    });
    res.send(buffer);
  } catch (err) {
    console.error("Error generating pass for claim:", err);
    res.status(500).json({ error: "Failed to generate pass" });
  }
});

// ═══════════════════════════════════════════════
//  QR CODE SCAN ENDPOINT (legacy, still works)
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
  const claimStatsRow = getClaimStats.get();
  res.json({
    totalCards: cards.length,
    activeCards: cards.filter((c) => c.is_active).length,
    totalScans: cards.reduce((sum, c) => sum + c.scan_count, 0),
    registeredDevices: regCount ? regCount.count : 0,
    claimedCards: claimStatsRow ? claimStatsRow.claimed : 0,
    unclaimedCards: claimStatsRow ? claimStatsRow.unclaimed : 0,
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

  // ── Fraud detection ──
  const warnings = [];
  const MAX_SCANS_PER_DAY = 5;

  // Check scans in the last 24 hours
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const recentScans = scans.filter(s => s.scanned_at > oneDayAgo);
  if (recentScans.length >= MAX_SCANS_PER_DAY) {
    warnings.push(`Used ${recentScans.length} times in 24hrs — possible sharing`);
  }

  // Check last scan time — if scanned very recently, flag it
  if (scans.length > 0) {
    const lastScan = new Date(scans[0].scanned_at);
    const minutesSinceLast = (now - lastScan) / 60000;
    if (minutesSinceLast < 5 && scans[0].business_name) {
      warnings.push(`Just scanned ${Math.round(minutesSinceLast)}min ago at ${scans[0].business_name}`);
    }
  }

  const hasWarning = warnings.length > 0;
  const statusColor = !isValid ? "#cc0000" : hasWarning ? "#cc8800" : "#1a7a1a";
  const statusText = !isActive ? "DEACTIVATED" : isExpired ? "EXPIRED" : hasWarning ? "VALID — CHECK ID" : "VALID";
  const statusEmoji = !isValid ? "&#10007;" : hasWarning ? "&#9888;" : "&#10003;";

  const warningHtml = hasWarning
    ? `<div class="warning">${warnings.map(w => `<div>&#9888; ${w}</div>`).join("")}</div>`
    : "";

  // Show active promotions
  const promos = getActivePromotions.all();
  const promoHtml = promos.length > 0
    ? `<div class="scan-count" style="margin-top:12px"><strong>Current Promotions:</strong><br>${promos.map(p => `${p.title}: ${p.message}`).join("<br>")}</div>`
    : "";

  // Last scan info for the cashier
  const lastScanHtml = scans.length > 0
    ? `<div class="detail"><span class="label">Last Scan</span><span>${scans[0].scanned_at}${scans[0].business_name ? ' at ' + scans[0].business_name : ''}</span></div>`
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
    .holder-name{font-size:22px;font-weight:700;background:rgba(255,255,255,0.15);padding:10px 16px;border-radius:8px;margin:8px 0 16px;letter-spacing:1px}
    .warning{background:rgba(0,0,0,0.3);border:2px solid #fff;border-radius:8px;padding:10px;margin:12px 0;font-size:13px;font-weight:600;text-align:left}
    .warning div{padding:3px 0}
    .cashier-tip{font-size:11px;opacity:0.7;margin-top:12px;font-style:italic}
  </style></head>
  <body>
    <div class="card">
      <div class="status">${statusEmoji}</div>
      <h1>DEL NORTE NIGHTHAWK</h1>
      <h2>Discount Card — ${statusText}</h2>
      ${card.holder_name ? `<div class="holder-name">${card.holder_name}</div>` : ''}
      ${warningHtml}
      <div class="detail"><span class="label">Card ID</span><span>${cardId}</span></div>
      <div class="detail"><span class="label">Promo Code</span><span style="font-weight:700;font-size:16px;letter-spacing:2px">DN2026</span></div>
      ${!card.holder_name ? '<div class="detail"><span class="label">Holder</span><span>General</span></div>' : ''}
      <div class="detail"><span class="label">Valid Thru</span><span>${card.valid_thru}</span></div>
      <div class="detail"><span class="label">Total Scans</span><span>${scans.length}</span></div>
      <div class="detail"><span class="label">Today</span><span>${recentScans.length} scans</span></div>
      ${lastScanHtml}
      ${card.holder_name ? '<div class="cashier-tip">Tip: Ask the customer to confirm their name matches above</div>' : ''}
      ${promoHtml}
    </div>
  </body></html>`;
}

// ═══════════════════════════════════════════════
//  CLAIM PAGE HTML (mobile users scan physical card QR)
// ═══════════════════════════════════════════════

function renderClaimPage(card, cardId, alreadyClaimed = false) {
  const promos = getActivePromotions.all();
  const promoHtml = promos.length > 0
    ? promos.map(p => `<div class="promo">${p.title}: ${p.message}</div>`).join("")
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Del Norte Nighthawk Discount Card</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,sans-serif;background:#002D62;color:#002D62;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:20px}
    .card{background:linear-gradient(135deg,#d4b96a,#C5A55A,#b89840);border-radius:16px;padding:30px 24px;max-width:360px;width:100%;text-align:center;margin-top:20px;box-shadow:0 8px 32px rgba(0,0,0,0.4)}
    .card h1{font-size:18px;letter-spacing:3px;margin-bottom:2px}
    .card h2{font-size:28px;font-weight:900;margin-bottom:2px}
    .card h3{font-size:16px;margin-bottom:16px}
    .card-id{font-family:monospace;font-size:13px;background:rgba(0,45,98,0.15);padding:6px 12px;border-radius:6px;display:inline-block;margin:8px 0;letter-spacing:2px}
    .form-group{text-align:left;margin:16px 0}
    .form-group label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
    .form-group input{width:100%;padding:10px 14px;border:1px solid #002D62;border-radius:8px;background:rgba(255,255,255,0.6);font-size:16px;color:#002D62;outline:none}
    .wallet-btn{display:inline-block;margin-top:16px;background:#000;color:#fff;font-size:16px;font-weight:600;padding:14px 28px;border-radius:12px;text-decoration:none;border:none;cursor:pointer}
    .wallet-btn:hover{background:#222}
    .info{margin-top:16px;font-size:12px;color:#C5A55A;max-width:360px;text-align:center;line-height:1.5}
    .already{background:rgba(26,122,26,0.15);color:#1a7a1a;padding:8px 16px;border-radius:8px;margin:12px 0;font-size:13px;font-weight:600}
    .promo{background:rgba(0,45,98,0.1);padding:8px 12px;border-radius:6px;margin:6px 0;font-size:12px;text-align:left}
    .promos-section{margin-top:12px}
    .promos-section h4{font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
  </style></head>
  <body>
    <div class="card">
      <h1>DEL NORTE</h1>
      <h2>NIGHTHAWK</h2>
      <h3>DISCOUNT CARD</h3>

      <div class="card-id">${cardId}</div>

      ${alreadyClaimed
        ? '<div class="already">This card has been added to a Wallet. Tap below to re-download.</div>'
        : '<p style="font-size:13px;margin:8px 0">Scan successful! Add this card to your Apple Wallet.</p>'
      }

      ${!alreadyClaimed ? `
      <div class="form-group">
        <label>Your Name (optional)</label>
        <input type="text" id="name" placeholder="e.g. John Doe">
      </div>
      ` : ''}

      <a id="walletLink" href="/card/${cardId}/claim" class="wallet-btn">
        ${alreadyClaimed ? 'Re-download to Wallet' : 'Add to Apple Wallet'}
      </a>

      ${promoHtml ? `<div class="promos-section"><h4>Current Deals</h4>${promoHtml}</div>` : ''}
    </div>

    <p class="info">
      Card must be presented for discount. Not good with any other offer.<br>
      Show this card or have the QR code scanned at checkout.
    </p>

    ${!alreadyClaimed ? `
    <script>
      const nameInput = document.getElementById('name');
      const walletLink = document.getElementById('walletLink');
      if (nameInput) {
        nameInput.addEventListener('input', () => {
          const name = nameInput.value.trim();
          walletLink.href = name ? '/card/${cardId}/claim?name=' + encodeURIComponent(name) : '/card/${cardId}/claim';
        });
      }
    </script>
    ` : ''}
  </body></html>`;
}

// ═══════════════════════════════════════════════
//  SPONSOR PORTAL — each business sees their own data
//  Login with their unique access code (no passwords)
// ═══════════════════════════════════════════════

app.get("/sponsor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "sponsor.html"));
});

app.post("/api/sponsor/login", (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Access code required" });

  const sponsor = getSponsorByCode.get(code.trim().toUpperCase());
  if (!sponsor) return res.status(401).json({ error: "Invalid access code" });

  const stats = getStatsForBusiness.get(sponsor.business_name) || {};
  const recentScans = getScansForBusiness.all(sponsor.business_name);

  // Group scans by day for a simple chart
  const scansByDay = {};
  recentScans.forEach(s => {
    const day = s.scanned_at.split(" ")[0]; // YYYY-MM-DD
    scansByDay[day] = (scansByDay[day] || 0) + 1;
  });

  res.json({
    business: sponsor.business_name,
    tier: sponsor.tier,
    discount: sponsor.discount_text,
    stats: {
      totalScans: stats.total_scans || 0,
      uniqueCustomers: stats.unique_customers || 0,
      lastScan: stats.last_scan || "No scans yet",
      firstScan: stats.first_scan || "N/A",
    },
    recentScans: recentScans.slice(0, 50).map(s => ({
      date: s.scanned_at,
      cardId: s.card_id,
      holder: s.holder_name || "General",
    })),
    scansByDay,
  });
});

app.listen(PORT, () => {
  console.log(`Del Norte Nighthawk Discount Pass server running at http://localhost:${PORT}`);
  console.log(`Download a pass:  http://localhost:${PORT}/pass`);
  console.log(`Admin dashboard:  http://localhost:${PORT}/admin`);
  console.log(`Sponsor portal:   http://localhost:${PORT}/sponsor`);
  console.log(`\nApple Wallet web service endpoints active at /v1/...`);
});
