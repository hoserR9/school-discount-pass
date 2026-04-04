# Developer Tasks — Del Norte Nighthawk Discount Card

## For Contributors

Welcome! Pick a task from below and follow the workflow.

### Workflow
1. Assign yourself by adding your name next to the task
2. Create a branch: `git checkout -b feature/task-name`
3. Make your changes
4. Write a test if applicable (see `docs/TESTING.md`)
5. Run `npm start` and verify locally
6. Push your branch and open a PR on GitHub
7. Get a review, merge, delete branch

---

## Priority 1 — Core Improvements

- [ ] **Write Jest unit tests** — convert the test plan in `docs/TESTING.md` into actual automated tests
  - Files: create `__tests__/` directory with `database.test.js`, `generate-pass.test.js`, `integrations.test.js`
  - Use Jest framework
  - Goal: 80%+ code coverage

- [ ] **Add basic auth to /admin route** — protect the admin dashboard before production launch
  - File: `server.js`
  - Use `express-basic-auth` package or custom middleware
  - Credentials stored in env var `ADMIN_PASSWORD`

- [ ] **Add authentication to sponsor API endpoints** — ensure only logged-in sponsors can see their data
  - File: `server.js`
  - Add session token or HTTP Basic Auth to `/api/sponsor/*` routes

## Priority 2 — POS Integrations (Real-World Testing)

- [ ] **Test Toast integration with sandbox credentials** — get Toast sandbox account, verify discount creation works
  - File: `src/integrations/toast.js`
  - Document the setup in a new `docs/TOAST-SETUP.md`

- [ ] **Test Square integration with sandbox credentials** — get Square sandbox account
  - File: `src/integrations/square.js`
  - Document in `docs/SQUARE-SETUP.md`

- [ ] **Build POS config UI in admin dashboard** — add a section to `public/admin.html` to configure each business's POS
  - File: `public/admin.html`
  - Dropdown for POS type, form fields for credentials per POS
  - Save via POST to `/api/pos-config`

## Priority 3 — Nice to Have

- [ ] **Add a "Export Scans to CSV" button** in sponsor dashboard
  - File: `public/sponsor.html`, `server.js`
  - Download scans as CSV for offline reporting

- [ ] **Add card expiration reminder emails** — notify cardholders 30 days before expiration
  - Requires adding email (optional) to claim page
  - Use SendGrid or similar

- [ ] **Add a QR code generator tool in admin dashboard** — generate a new card on the fly
  - File: `public/admin.html`
  - Calls `/pass?name=X` and shows QR code image

- [ ] **Improve the Harland Brewing logo** — current one is decent but could be higher quality
  - Location: `design/sponsor-logos/harland-brewing.png`

- [ ] **Add Instagram/social sharing** to the claim page after adding to Wallet
  - File: `server.js` claim page HTML

## Priority 4 — Advanced

- [ ] **Add NFC encryption key generation** — generate RSA keypair for NFC passes
  - File: `src/generate-pass.js`
  - Create a setup script `node scripts/generate-nfc-keys.js`

- [ ] **Implement push notification rate limiting** — don't push more than 2 promos per week per cardholder
  - File: `src/push-update.js`, `src/database.js`
  - Add `notifications_sent` tracking

- [ ] **Add webhooks for scan events** — allow sponsors to receive real-time scan notifications
  - File: `server.js`
  - New table for webhook URLs per sponsor

---

## How to Pick a Task

1. Read the project README and existing docs
2. Run the app locally first (`npm install && npm start`)
3. Pick a Priority 1 task if you're new
4. Ask questions in GitHub Issues or in a PR comment

## Code Standards

- Use the existing code patterns (look at similar features)
- Keep commits small and focused
- Write clear commit messages
- No secrets in code — use environment variables
- Update documentation when you add features
