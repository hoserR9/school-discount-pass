const express = require("express");
const path = require("path");
const { generatePass } = require("./src/generate-pass");
const { getCard, logScan, getScansForCard, getAllCards, getUsageStats, deactivateCard } = require("./src/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ──────────────────────────────────────────────
// Generate and download a new pass
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// QR Code scan endpoint — this is what businesses hit
// when they scan the QR code on the pass
// ──────────────────────────────────────────────
app.get("/scan/:cardId", (req, res) => {
  const { cardId } = req.params;
  const businessName = req.query.biz || null;
  const card = getCard.get(cardId);

  if (!card) {
    return res.status(404).send(renderScanPage(null, cardId));
  }

  // Log the scan
  logScan.run(cardId, businessName, req.ip, req.get("user-agent") || "");
  const scans = getScansForCard.all(cardId);

  console.log(`[SCAN] Card ${cardId} scanned${businessName ? ` at ${businessName}` : ""} (total: ${scans.length})`);

  res.send(renderScanPage(card, cardId, scans));
});

// ──────────────────────────────────────────────
// Admin API — view all cards and usage stats
// ──────────────────────────────────────────────
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
  res.json({
    totalCards: cards.length,
    activeCards: cards.filter(c => c.is_active).length,
    totalScans: cards.reduce((sum, c) => sum + c.scan_count, 0),
    byBusiness: stats,
  });
});

app.post("/api/cards/:cardId/deactivate", (req, res) => {
  deactivateCard.run(req.params.cardId);
  res.json({ success: true });
});

// ──────────────────────────────────────────────
// Scan result page HTML
// ──────────────────────────────────────────────
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
    </div>
  </body></html>`;
}

app.listen(PORT, () => {
  console.log(`Del Norte Nighthawk Discount Pass server running at http://localhost:${PORT}`);
  console.log(`Download a pass:  http://localhost:${PORT}/pass`);
  console.log(`Admin dashboard:  http://localhost:${PORT}/admin`);
});
