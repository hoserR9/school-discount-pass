#!/usr/bin/env node
/**
 * Seed sponsor accounts with access codes for the sponsor portal.
 * Each sponsor gets a unique code they use to log into /sponsor
 * and view their own scan analytics.
 *
 * Usage: node seed-sponsors.js
 */

const crypto = require("crypto");
const { createSponsor, getAllSponsors } = require("./src/database");

function generateCode() {
  // 6-char alphanumeric, easy to type/share
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

const sponsors = [
  { name: "Baskin Robbins", discount: "BOGO 50% off scoops", tier: "silver" },
  { name: "Harland Brewing", discount: "10% off", tier: "silver" },
  { name: "Board & Brew", discount: "10% off", tier: "gold" },
  { name: "L&L Hawaiian Barbecue", discount: "10% off", tier: "silver" },
  { name: "Kahoots", discount: "20% off treats & bones", tier: "silver" },
  { name: "Mostra Coffee", discount: "10% off", tier: "gold" },
  { name: "Rosinas", discount: "10% off", tier: "silver" },
  { name: "Donut Touch", discount: "10% off", tier: "bronze" },
  { name: "Sushi Ken", discount: "20% off, dine-in/carry out", tier: "silver" },
  { name: "Flippin Pizza", discount: "$5 off orders over $15", tier: "silver" },
  { name: "Round Table Pizza", discount: "10% off (Rancho Bernardo)", tier: "bronze" },
];

console.log("\nSeeding sponsor accounts...\n");
console.log("Business".padEnd(28) + "Access Code".padEnd(14) + "Tier");
console.log("─".repeat(52));

sponsors.forEach((s) => {
  const code = generateCode();
  createSponsor.run(s.name, code, null, null, s.discount, s.tier);
  console.log(s.name.padEnd(28) + code.padEnd(14) + s.tier);
});

console.log("\n" + "─".repeat(52));
console.log(`\n${sponsors.length} sponsors seeded.`);
console.log("Share each business their access code for the sponsor portal at /sponsor\n");

// Show all sponsors in DB
const all = getAllSponsors.all();
console.log(`Total sponsors in DB: ${all.length}\n`);
