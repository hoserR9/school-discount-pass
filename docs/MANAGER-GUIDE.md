# Manager's Guide — Running This Project

## Your Role

You're the project lead. You don't need to write code every day, but you own the roadmap, prioritize work, review pull requests, and coordinate testing with real businesses. This guide walks you through how to manage a solo developer (your son) or a small team.

---

## Daily/Weekly Rhythm

### Every few days (15-30 minutes)
1. **Check GitHub for new PRs** waiting for your review
2. **Review and merge** approved PRs
3. **Assign new tasks** from `docs/TASKS.md` or create new issues
4. **Test the live deployment** on Railway to make sure nothing's broken

### Weekly
1. **1-on-1 with your developer** — what did they ship, what are they working on, what's blocking them
2. **Update the roadmap** based on progress and pilot feedback
3. **Review metrics** once cards are live (scans, active users, errors)

---

## How to Assign a Task

### Option 1: GitHub Issues (Recommended)

1. Go to https://github.com/hoserR9/school-discount-pass/issues
2. Click **New Issue**
3. Use this template:

```
**Task:** [Short description]

**Why this matters:** [Business reason]

**What "done" looks like:**
- [ ] [Specific thing 1]
- [ ] [Specific thing 2]
- [ ] Tests pass (manual or automated)
- [ ] Documentation updated if needed

**Priority:** High / Medium / Low
**Estimate:** [rough time — e.g., "half a day"]

**Context/Links:**
- [Related files]
- [Related docs]
```

4. Assign it to your developer's GitHub username
5. Add a label (e.g., `priority-1`, `bug`, `feature`)
6. They'll get an email notification

### Option 2: Tell them directly

Pick a task from `docs/TASKS.md` and say "work on this next." Works for small teams.

---

## How to Review a Pull Request

When your developer finishes a task, they open a Pull Request (PR). You need to review it before merging.

### Review checklist

1. **Click the PR link** in your email or GitHub notifications
2. **Read the description** — does it match what you asked for?
3. **Look at the "Files changed" tab** — see what code was modified
4. **Check the commits** — are they clean and descriptive?
5. **Ask questions** via PR comments if something's unclear
6. **Test it locally** (optional but good for big changes):
   ```bash
   git fetch origin
   git checkout feature/their-branch-name
   npm install
   npm start
   # Test it in your browser
   ```
7. **Approve or Request Changes**
8. **Merge** when ready — click the green "Merge pull request" button
9. **Delete the branch** after merging (GitHub prompts you)

### Good comments to leave on PRs

- "Looks good, approved!"
- "Can you add a test for this?"
- "Nice refactor. One question: [question]"
- "Let's discuss this — move to a call?"

### Things to watch for

- **Secrets in code** — API keys, passwords, tokens should NEVER be in the code. They go in environment variables (Railway dashboard).
- **Breaking changes** — does this change break existing features? Test by running `npm start` locally.
- **Security issues** — admin routes without auth, SQL injection risk, etc.
- **Scope creep** — if the PR does way more than the task, ask them to split it up.

---

## How Your Developer's Workflow Should Look

From their perspective, each task follows this flow:

```
1. Pick task from Issues or TASKS.md
2. Create branch:           git checkout -b feature/task-name
3. Make changes, commit:    git commit -m "Clear message"
4. Push branch:             git push -u origin feature/task-name
5. Open PR on GitHub
6. You review and merge
7. Delete branch:           git branch -d feature/task-name
8. Start next task
```

**You never see them push directly to `main`** — everything goes through PRs because of the branch protection rule you set up.

---

## Priorities (In Order)

### Phase 1: Launch Prep (next 2 weeks)
1. Jest unit tests (regression safety net)
2. Basic auth on /admin (security before going live)
3. Test Toast integration with sandbox account
4. Test Square integration with sandbox account

### Phase 2: Pilot (weeks 3-4)
1. Generate physical cards with QR codes
2. Print and deliver to first test business
3. Train one cashier
4. Monitor scans via admin dashboard
5. Collect feedback

### Phase 3: Full Launch (month 2)
1. Build POS config UI in admin dashboard
2. Onboard remaining 10 sponsors
3. Print full batch of cards for the season
4. Launch marketing (social media, game day announcements)

### Phase 4: Polish (ongoing)
1. CSV exports for sponsor reports
2. Expiration reminder emails
3. Better analytics dashboard
4. NFC tap support

---

## Managing a New Developer

### First week — get them productive

**Day 1:** Onboarding
- Add them as GitHub collaborator
- Have them read: README.md, docs/CONTRIBUTING.md, docs/TESTING.md
- Have them clone the repo and run `npm start` locally
- Have them make one tiny change (fix a typo in README) and open their first PR

**Day 2-3:** First real task
- Assign a Priority 1 task from TASKS.md
- Check in after 1 day to see if they're blocked
- Review their first real PR together, explain your thinking

**Week 1 retrospective:**
- What did they learn?
- What was confusing?
- What did you learn about how they work?

### Ongoing — keep them unblocked

- **Respond to PRs within 24 hours** — nothing kills momentum like waiting for a review
- **Be clear about priorities** — if you change direction, tell them
- **Give feedback, not just corrections** — "I'd prefer X because Y" teaches them
- **Celebrate shipped work** — when something goes live, acknowledge it

### Common issues with junior devs

| Issue | How to handle |
|-------|--------------|
| PRs are too big | Ask them to split into smaller ones |
| Unclear commits | Review commit messages in PR, coach on style |
| Works on their machine but not yours | Have them write a test to prove it works |
| Gets stuck for hours without asking | Schedule daily 5-min check-ins |
| Wants to rewrite everything | Redirect to Priority 1 tasks — "let's make this solid first" |

---

## Project Health Checks

### Weekly questions

- How many cards issued this week?
- How many scans?
- Any businesses having issues?
- Any bugs reported?
- Is the Railway server healthy?

### Monthly questions

- Are sponsors renewing/adding?
- What features are most requested?
- Is the fraud detection working (any false flags?)
- Cost check — still within budget?

### Metrics to track

Visit `/admin` on the Railway URL to see:
- Total cards issued
- Active cards
- Total scans
- Registered Wallet devices
- Scans by business

Export these monthly for the football program board.

---

## When Things Break

### Server is down (Railway)
1. Check Railway dashboard — look at deployment logs
2. If a recent deploy broke it, roll back to previous deployment
3. If a cert expired, check env vars

### Pass generation broken
1. Check if certs are set in Railway env vars
2. Check if Apple Developer account is still active ($99/year renewal)
3. Look at server logs for error messages

### Sponsor can't log in
1. Go to admin dashboard
2. Check their access code
3. Regenerate if needed: `node seed-sponsors.js`

### QR code doesn't work
1. Scan the QR with an iPhone — does it open the claim page?
2. Check if `BASE_URL` in Railway points to the right URL
3. Check if the card exists in the database

---

## Tools You'll Use

| Tool | What for | URL |
|------|----------|-----|
| GitHub | Code, issues, PRs | https://github.com/hoserR9/school-discount-pass |
| Railway | Production server | https://railway.app |
| Apple Developer | Certs, Pass Type ID | https://developer.apple.com |
| Admin dashboard | Cards, scans, promos | https://web-production-9f35d.up.railway.app/admin |
| Claude Code | AI coding assistant | https://claude.com/claude-code |

---

## Communication

### With your developer
- **Quick questions:** Text, Slack, or PR comments
- **Weekly sync:** 15-30 minute call to review progress and priorities
- **PR reviews:** GitHub comments (keep them there for history)

### With sponsors
- **Onboarding:** Email or in-person meeting to get their POS credentials
- **Updates:** Monthly email with their scan stats
- **Support:** Create a simple contact form on the sponsor portal

### With the school board
- **Present updates** monthly with numbers
- **Use the board deck** at `pitch/Del-Norte-Board-Approval.pptx`
- **Share the security doc** if asked about data privacy

---

## Quick Reference

**Repo:** https://github.com/hoserR9/school-discount-pass
**Live site:** https://web-production-9f35d.up.railway.app

**Key files:**
- `docs/TASKS.md` — backlog of tasks
- `docs/CONTRIBUTING.md` — developer onboarding
- `docs/TESTING.md` — test plan
- `docs/POS-COMPATIBILITY.md` — which POS systems we support
- `docs/SECURITY.md` — security talking points for sponsors
- `pitch/Del-Norte-Nighthawk-Sponsor-Pitch.pptx` — sponsor deck
- `pitch/Del-Norte-Board-Approval.pptx` — board deck

**Key commands:**
```bash
# Start local server
npm start

# Generate test cards
node generate-batch.js --count 5

# Seed sponsor access codes
node seed-sponsors.js

# Rebuild slide decks
node pitch/rebuild-decks.js
```

---

*This is your manager's playbook. Update it as the project grows.*
