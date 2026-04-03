/**
 * Apple Push Notification service (APNs) module for Wallet pass updates.
 *
 * When you push an update, Apple Wallet on each registered iPhone will:
 * 1. Receive the push notification
 * 2. Call GET /v1/passes/:passTypeId/:serialNumber on your server
 * 3. Download the updated pass
 * 4. Show a lock-screen notification that the card was updated
 *
 * Requires either:
 * - Token-based auth: APNs key (.p8 file) + Key ID + Team ID
 * - Certificate-based auth: APNs certificate (.pem)
 *
 * Set these environment variables:
 *   APNS_KEY_PATH    — path to your .p8 key file
 *   APNS_KEY_ID      — your APNs key ID
 *   APNS_TEAM_ID     — your Apple Developer Team ID
 *   APNS_USE_SANDBOX — set to "true" for development (default: true)
 */

const fs = require("fs");
const path = require("path");
const { getAllPushTokens, getDevicesForSerial, touchCardUpdated } = require("./database");
const { PASS_TYPE_ID } = require("./generate-pass");

const APNS_KEY_PATH = process.env.APNS_KEY_PATH || path.resolve(__dirname, "../certs/apns-key.p8");
const APNS_KEY_ID = process.env.APNS_KEY_ID || "PLACEHOLDER";
const APNS_TEAM_ID = process.env.APNS_TEAM_ID || "PLACEHOLDER";
const APNS_USE_SANDBOX = process.env.APNS_USE_SANDBOX !== "false"; // default true

/**
 * Send push updates to all registered devices.
 * Returns { sent: number, failed: number, errors: string[] }
 */
async function pushUpdateToAll() {
  const tokens = getAllPushTokens.all();

  if (tokens.length === 0) {
    return { sent: 0, failed: 0, errors: [], message: "No registered devices" };
  }

  // Check if APNs key is available (env var or file)
  const hasEnvKey = !!process.env.APNS_KEY;
  const hasFileKey = fs.existsSync(APNS_KEY_PATH);
  if (!hasEnvKey && !hasFileKey) {
    return {
      sent: 0,
      failed: 0,
      errors: ["APNs key not found. Set APNS_KEY env var or place .p8 at " + APNS_KEY_PATH],
      message: "APNs not configured — push skipped",
    };
  }

  try {
    // Dynamic import since hapns is ESM-only
    const { BackgroundNotification } = await import("hapns/notifications/BackgroundNotification");
    const { Device } = await import("hapns/targets/device");
    const { TokenConnector } = await import("hapns/connectors/token");
    const { send } = await import("hapns/send");

    // Load APNs key from env (base64) or file
    const p8key = hasEnvKey
      ? new Uint8Array(Buffer.from(process.env.APNS_KEY, "base64"))
      : new Uint8Array(fs.readFileSync(APNS_KEY_PATH));

    const connector = TokenConnector({
      key: p8key,
      keyId: APNS_KEY_ID,
      teamIdentifier: APNS_TEAM_ID,
    });

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const { push_token } of tokens) {
      try {
        const device = Device(push_token);

        // For Wallet pass updates, send a background notification with the pass type ID as topic
        const notification = BackgroundNotification(PASS_TYPE_ID, {});

        await send(connector, notification, device, {
          useSandbox: APNS_USE_SANDBOX,
        });
        sent++;
      } catch (err) {
        failed++;
        errors.push(`Token ${push_token.substring(0, 8)}...: ${err.message}`);
      }
    }

    return { sent, failed, errors, message: `Pushed to ${sent}/${tokens.length} devices` };
  } catch (err) {
    return {
      sent: 0,
      failed: tokens.length,
      errors: [err.message],
      message: "Push failed: " + err.message,
    };
  }
}

/**
 * Send push update to devices registered for a specific pass.
 */
async function pushUpdateForSerial(serialNumber) {
  const devices = getDevicesForSerial.all(serialNumber);

  if (devices.length === 0) {
    return { sent: 0, failed: 0, errors: [], message: "No devices registered for this pass" };
  }

  // Touch the card's last_updated timestamp so the device knows there's a new version
  touchCardUpdated.run(serialNumber);

  const hasEnvKey2 = !!process.env.APNS_KEY;
  const hasFileKey2 = fs.existsSync(APNS_KEY_PATH);
  if (!hasEnvKey2 && !hasFileKey2) {
    return {
      sent: 0,
      failed: 0,
      errors: ["APNs key not configured"],
      message: "APNs not configured — update timestamp set but push skipped",
    };
  }

  try {
    const { BackgroundNotification } = await import("hapns/notifications/BackgroundNotification");
    const { Device } = await import("hapns/targets/device");
    const { TokenConnector } = await import("hapns/connectors/token");
    const { send } = await import("hapns/send");

    const p8key = hasEnvKey2
      ? new Uint8Array(Buffer.from(process.env.APNS_KEY, "base64"))
      : new Uint8Array(fs.readFileSync(APNS_KEY_PATH));
    const connector = TokenConnector({
      key: p8key,
      keyId: APNS_KEY_ID,
      teamIdentifier: APNS_TEAM_ID,
    });

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const { push_token } of devices) {
      try {
        const device = Device(push_token);
        const notification = BackgroundNotification(PASS_TYPE_ID, {});
        await send(connector, notification, device, { useSandbox: APNS_USE_SANDBOX });
        sent++;
      } catch (err) {
        failed++;
        errors.push(err.message);
      }
    }

    return { sent, failed, errors, message: `Pushed to ${sent}/${devices.length} devices` };
  } catch (err) {
    return { sent: 0, failed: devices.length, errors: [err.message], message: err.message };
  }
}

module.exports = { pushUpdateToAll, pushUpdateForSerial };
