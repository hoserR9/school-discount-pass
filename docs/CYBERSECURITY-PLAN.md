# Cybersecurity Plan — Del Norte Nighthawk Discount Card

## Document Purpose

This cybersecurity plan defines the security controls, policies, and procedures for the Nighthawk Discount Card system. It covers data protection, access control, threat mitigation, incident response, and compliance.

**Last Updated:** April 2026
**Review Cycle:** Quarterly (or after any security incident)
**Owner:** Del Norte HS Football Program Admin

---

## 1. System Overview

The Nighthawk Discount Card system consists of:
- **Web server** (Node.js/Express on Railway.app) — generates passes, tracks scans, serves dashboards
- **Apple Wallet passes** — digital discount cards on iPhones
- **SQLite database** — stores card records, scan logs, sponsor data, POS configs
- **Apple Push Notification service (APNs)** — sends card updates to devices
- **POS integrations** — connects to Toast, Square, Clover, Shopify, Revel, SpotOn, Heartland

### Data Classification

| Data Type | Classification | Examples |
|-----------|---------------|----------|
| Card IDs | Internal | DN-1BC3EC6FA8B9E358 |
| Auth tokens | Confidential | 64-char hex strings |
| Holder names | Personal (optional) | "John Doe" |
| Scan timestamps | Internal | 2026-10-04 18:32 |
| Business names | Public | "Board & Brew" |
| Sponsor access codes | Confidential | 12-char hex codes |
| POS API credentials | Confidential | Toast/Square API keys |
| APNs signing key | Confidential | .p8 key file |
| Apple signing certs | Confidential | PEM certificates |
| Device push tokens | Confidential | Apple device identifiers |

---

## 2. Security Controls Implemented

### 2.1 Authentication

| Control | Status | Details |
|---------|--------|---------|
| Admin dashboard auth | Implemented | HTTP Basic Auth via ADMIN_PASSWORD env var |
| Admin API auth | Implemented | All /api/* admin routes require authentication |
| Sponsor portal auth | Implemented | 12-char hex access codes with rate limiting |
| Apple Wallet auth | Implemented | 64-char auth tokens per pass, validated on every request |
| POS integration auth | Implemented | Per-business API credentials stored as encrypted env vars |

### 2.2 Rate Limiting

| Endpoint | Limit | Purpose |
|----------|-------|---------|
| Global (all routes) | 100 req/min per IP | Prevents DoS and brute-force |
| Sponsor login | 10 req/min per IP | Prevents access code brute-force |
| Card scan | 100 req/min per IP (global) | Prevents scan flooding |
| Push notifications | Admin-only | Prevents spam pushes |

### 2.3 Input Validation & Sanitization

| Input | Validation | Max Length |
|-------|-----------|-----------|
| Holder name | HTML entity encoding, tag stripping | 200 chars |
| Business name | HTML entity encoding | 200 chars |
| Promotion title/message | HTML entity encoding | 200 chars |
| Card ID format | Alphanumeric with prefix | 19 chars (DN- + 16 hex) |
| Sponsor access code | Alphanumeric, case-insensitive | 12 chars |
| Request body | JSON size limit | 50 KB |

### 2.4 Encryption

| Layer | Method | Details |
|-------|--------|---------|
| In transit | TLS 1.3 (HTTPS) | Enforced via Railway SSL + HTTPS redirect |
| Auth tokens | Cryptographic random | crypto.randomBytes(32) — 256-bit entropy |
| Card IDs | Cryptographic random | crypto.randomBytes(8) — 64-bit entropy |
| NFC communication | RSA encryption | Apple secure element |
| API keys in Railway | Environment variables | Not in code or git |
| Apple signing certs | Base64 env vars | Loaded at runtime from Railway env |

### 2.5 Security Headers (via Helmet)

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | self + inline scripts/styles | Prevents external script injection |
| X-Content-Type-Options | nosniff | Prevents MIME type sniffing |
| X-Frame-Options | DENY | Prevents clickjacking |
| X-XSS-Protection | 1; mode=block | Browser XSS filter |
| Strict-Transport-Security | max-age=15552000 | Forces HTTPS |
| Referrer-Policy | no-referrer | Prevents referrer leakage |

### 2.6 Anti-Fraud Controls

| Control | Trigger | Action |
|---------|---------|--------|
| Rate limiting per card | 5+ scans in 24 hours | Yellow warning screen, "CHECK ID" |
| Rapid scan detection | Same card < 5 min at different business | Warning with last scan location |
| Name verification | Every scan | Holder name shown in large text for cashier to verify |
| Instant deactivation | Admin decision | Card immediately shows DEACTIVATED on next scan |
| Screenshot resistance | Always | Apple Wallet barcode animates; screenshots are static |

---

## 3. Access Control Policy

### 3.1 Role Definitions

| Role | Access | Auth Method |
|------|--------|-------------|
| **Public** | Card distribution page, terms page, claim page | None |
| **Cardholder** | View their card in Wallet, scan at businesses | Apple Wallet auth token |
| **Business cashier** | Scan verification page (via QR) | Card QR code scan |
| **Sponsor** | Own business analytics dashboard | 12-char access code + rate limiting |
| **Admin** | Full dashboard, all cards, promotions, POS config, push | HTTP Basic Auth (ADMIN_PASSWORD) |

### 3.2 Principle of Least Privilege

- Sponsors see **only their own** business data (filtered by business_name)
- Sponsors **cannot** see other sponsors' data, card IDs with names, or admin controls
- Cashiers see **only** the verification result for the card they scanned
- Cardholders see **only** their own card in Apple Wallet
- Admin has **full access** — this role should be limited to 1-2 people

### 3.3 Credential Management

| Credential | Storage | Rotation |
|-----------|---------|----------|
| ADMIN_PASSWORD | Railway env var | Change quarterly or after any staff change |
| Apple signing certs | Railway env vars (base64) | Annual (Apple expires them) |
| APNs .p8 key | Railway env var (base64) | Annual or if compromised |
| Sponsor access codes | Database | Regenerate if a code is compromised |
| POS API credentials | Database (pos_config table) | Per business policy, rotate if compromised |

---

## 4. Threat Model

### 4.1 Threat Actors

| Actor | Motivation | Capability |
|-------|-----------|------------|
| **Student sharing screenshots** | Free discounts for friends | Low — screenshots don't have live barcodes |
| **External brute-force attacker** | Access sponsor data or admin | Medium — blocked by rate limiting and strong codes |
| **Disgruntled card holder** | Abuse the system | Low — deactivation available |
| **Competitor** | Access business analytics | Medium — blocked by sponsor auth |
| **Opportunistic hacker** | Data theft, defacement | Medium — mitigated by security headers, auth, HTTPS |

### 4.2 Attack Surface

| Surface | Exposure | Controls |
|---------|----------|----------|
| Public web pages | High | CSP headers, input sanitization, rate limiting |
| Admin dashboard | Medium | Basic auth, HTTPS, rate limiting |
| Sponsor portal | Medium | Access codes, rate limiting |
| Apple Wallet web service | Low | Auth tokens (64-char), HTTPS |
| POS scan endpoint | Medium | Rate limiting, fraud detection |
| Railway server | Low | Container isolation, SOC 2 hosting |
| SQLite database | Low | Server-only access, not publicly exposed |

### 4.3 Risk Matrix

| Threat | Likelihood | Impact | Risk | Mitigation |
|--------|-----------|--------|------|------------|
| Screenshot sharing | High | Low | Low | Name verification, rate limiting |
| Brute-force sponsor code | Medium | Medium | Medium | 12-char codes + 10 req/min limit |
| Brute-force admin | Low | Critical | Medium | Rate limiting, strong password |
| XSS injection | Low | High | Medium | Input sanitization, CSP headers |
| DDoS on server | Low | Medium | Low | Railway infrastructure, rate limiting |
| Database leak | Low | High | Medium | Not publicly accessible, encrypted transit |
| POS key compromise | Low | High | Medium | Per-business isolation, env var storage |

---

## 5. Incident Response Plan

### 5.1 Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| **P1 — Critical** | System compromised, data leaked | Immediate (< 1 hour) | Admin credentials exposed, database breach |
| **P2 — High** | Service disrupted or vulnerability actively exploited | Same day (< 4 hours) | DDoS, POS credentials leaked |
| **P3 — Medium** | Vulnerability found, not yet exploited | Within 48 hours | XSS found, weak config |
| **P4 — Low** | Minor issue, cosmetic or low risk | Within 1 week | Expired cert, minor bug |

### 5.2 Response Procedures

#### P1 — Critical Incident
1. **Contain**: Take the Railway deployment offline (pause in dashboard)
2. **Notify**: Inform school administration and affected sponsors
3. **Assess**: Determine scope of compromise (which data, which users)
4. **Remediate**: Fix the vulnerability, rotate all credentials
5. **Recover**: Restore service with fixes applied
6. **Review**: Post-incident report within 48 hours

#### P2 — High Incident
1. **Assess**: Determine if actively being exploited
2. **Mitigate**: Block attacking IPs, disable affected feature
3. **Fix**: Deploy a code fix within 4 hours
4. **Monitor**: Watch for recurrence over 48 hours

#### P3/P4 — Medium/Low
1. **Document**: Create a GitHub Issue with severity label
2. **Assign**: Developer picks it up in next sprint
3. **Fix**: Deploy fix within 48 hours (P3) or 1 week (P4)
4. **Verify**: Confirm fix resolves the issue

### 5.3 Communication Plan

| Audience | What to tell them | When |
|----------|------------------|------|
| School board | Incident summary, impact, resolution | Within 24 hours of P1/P2 |
| Sponsors | If their data was affected | Within 24 hours of P1 |
| Cardholders | If their data was affected | As required by CCPA (within 72 hours) |
| Apple | If pass signing certs were compromised | Immediately — revoke certs |

---

## 6. Data Protection

### 6.1 Data Retention Schedule

| Data | Retention | Deletion Method |
|------|-----------|----------------|
| Card records | Card validity + 12 months | Database DELETE |
| Scan logs | Card validity + 12 months | Database DELETE |
| Device push tokens | Until card removed from Wallet | Auto-delete on unregister |
| Sponsor access codes | Sponsorship term | Database DELETE |
| POS API credentials | Sponsorship term | Database DELETE + revoke with business |
| Server logs | 30 days | Railway auto-rotation |

### 6.2 Data Backup

| What | Frequency | Method | Stored |
|------|-----------|--------|--------|
| SQLite database | Daily | Download from Railway volume | Encrypted local backup |
| Environment variables | On change | Screenshot of Railway vars (redacted) | Password manager |
| Source code | Every commit | GitHub | Backed up automatically |

### 6.3 Data Deletion Requests (CCPA)

When a cardholder requests data deletion:
1. Identify their card ID(s)
2. Delete from `cards` table
3. Delete from `scans` table
4. Delete from `registrations` table
5. Confirm deletion to the requester
6. Log the deletion request in audit trail

---

## 7. Security Testing

### 7.1 Regular Testing

| Test | Frequency | Method |
|------|-----------|--------|
| Smoke test (12 endpoints) | Every code change | Automated script |
| Input validation testing | Monthly | Manual + automated fuzzing |
| Dependency audit | Weekly | `npm audit` |
| Rate limiting verification | Monthly | Manual testing with curl |
| Admin auth bypass testing | Monthly | Manual testing |
| XSS testing | Monthly | Manual + automated (OWASP ZAP) |

### 7.2 Before Production Launch

- [ ] All 12 smoke tests pass
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] ADMIN_PASSWORD set in Railway (strong, 20+ chars)
- [ ] All Apple certs set as Railway env vars (not in code)
- [ ] HTTPS redirect working
- [ ] Rate limiting verified (sponsor login, global)
- [ ] XSS tested on all input fields (holder name, promo title, business name)
- [ ] Admin dashboard requires auth
- [ ] Sponsor portal rate limited
- [ ] Error messages don't leak internals

### 7.3 Penetration Testing (Recommended)

For a school fundraiser project, a full pentest is overkill, but these quick checks are worth doing:
1. Try to access `/admin` without credentials → should get 401
2. Try to access `/api/cards` without auth → should get 401
3. Submit `<script>alert(1)</script>` as a holder name → should be sanitized
4. Try 20 sponsor login attempts in 1 minute → should get rate limited
5. Try an invalid card ID → should get 404, no internal error details

---

## 8. Third-Party Security

### 8.1 Service Providers

| Provider | Purpose | Security |
|----------|---------|----------|
| **Railway.app** | Server hosting | SOC 2 compliant, container isolation, auto-SSL |
| **GitHub** | Source code | 2FA recommended, branch protection enabled |
| **Apple Developer** | Pass signing, APNs | Apple's security infrastructure |
| **Toast/Square/Clover** | POS integrations | Each business manages their own credentials |

### 8.2 Dependency Management

- Run `npm audit` weekly
- Use `npm audit fix` to patch known vulnerabilities
- Pin major versions in package.json to avoid unexpected breaking changes
- Review changelogs before updating major dependencies

---

## 9. Compliance Checklist

### CCPA (California Consumer Privacy Act)
- [x] Privacy policy posted at `/terms`
- [x] Data collection disclosed (what we collect, why)
- [x] Right to know (cardholders can request their data)
- [x] Right to delete (cardholder data deletion process defined)
- [x] No sale of personal information
- [x] No sharing for marketing purposes
- [x] Children's privacy considered (minimal data for minors)

### Apple Wallet Guidelines
- [x] Passes signed with Apple-issued certificates
- [x] Web service endpoints follow Apple specification
- [x] Push notifications use official APNs channels
- [x] Authentication tokens meet 16-char minimum (ours: 64 chars)

### FERPA Considerations
If this system is ever formally integrated with the school's student records:
- Student names should not be stored without written parent consent
- Currently the name field is **optional** and not linked to school records
- The system does NOT access student databases or enrollment data

---

## 10. Security Roadmap

### Completed
- [x] Admin authentication (HTTP Basic Auth)
- [x] Rate limiting (global + sponsor login)
- [x] Security headers (Helmet)
- [x] HTTPS enforcement in production
- [x] Input sanitization (HTML escaping, length limits)
- [x] Strengthened card IDs (64-bit entropy)
- [x] Strengthened sponsor codes (48-bit entropy)
- [x] Error message sanitization (no internal details leaked)
- [x] Request body size limits

### Short-term (Before Launch)
- [ ] Set ADMIN_PASSWORD in Railway (strong, 20+ characters)
- [ ] Set real Apple certificates in Railway
- [ ] Run pre-launch security checklist (Section 7.2)
- [ ] Add audit logging table for admin actions
- [ ] Encrypt POS API credentials at rest

### Medium-term (After Launch)
- [ ] Implement CSRF tokens on admin forms
- [ ] Add session management with server-side state for sponsors
- [ ] Add IP whitelisting option for admin access
- [ ] Set up automated security scanning (GitHub Dependabot)
- [ ] Regular dependency audits

### Long-term
- [ ] Migrate sponsor auth to OAuth2
- [ ] Add 2FA for admin access
- [ ] Database encryption at rest (SQLCipher)
- [ ] Automated penetration testing
- [ ] SOC 2 compliance for the application itself
- [ ] Web Application Firewall (WAF)

---

## 11. Key Contacts

| Role | Responsibility |
|------|---------------|
| Program Admin | Overall security decisions, incident response |
| Lead Developer | Code security, patching, deployment |
| Apple Developer Account | Certificate management, APNs configuration |
| Railway Account | Infrastructure, environment variables |
| School IT (if applicable) | Network security, domain management |

---

*This document should be reviewed quarterly and updated after any security incident, major code change, or system architecture change.*
