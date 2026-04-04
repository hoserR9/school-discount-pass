# Contributing to Del Norte Nighthawk Discount Card

## Getting Started

### Prerequisites
- **Node.js 18+** (install via https://nodejs.org or `brew install node`)
- **Git** (install via Xcode command line tools: `xcode-select --install`)
- **A code editor** (VS Code, Cursor, or similar)
- **Claude Code** (optional but recommended): https://claude.com/claude-code

### Setup

```bash
# Clone the repo
git clone https://github.com/hoserR9/school-discount-pass.git
cd school-discount-pass

# Install dependencies
npm install

# Start the local server
npm start
```

Open http://localhost:3000 — you should see the Nighthawk card page.

### Project Structure

```
school-discount-pass/
├── server.js                  # Main Express server
├── src/
│   ├── generate-pass.js       # Apple Wallet pass generation
│   ├── database.js            # SQLite database layer
│   ├── push-update.js         # APNs push notifications
│   └── integrations/          # POS system integrations
│       ├── index.js           # Router
│       ├── toast.js
│       ├── square.js
│       ├── clover.js
│       └── ...
├── public/                    # Static HTML pages
│   ├── index.html             # Card distribution page
│   ├── admin.html             # Admin dashboard
│   ├── sponsor.html           # Sponsor login portal
│   └── terms.html             # Legal documents
├── models/
│   └── discount-card.pass/    # Apple Wallet pass template
├── design/                    # Card designs, logos, QR codes
├── docs/                      # All documentation
├── pitch/                     # Sponsor/board presentations
├── certs/                     # Placeholder certificates
└── data/                      # SQLite database (gitignored)
```

---

## Git Workflow

### Creating a feature branch

```bash
# Always start from main
git checkout main
git pull origin main

# Create a new branch (use kebab-case, descriptive)
git checkout -b feature/add-jest-tests
```

### Making changes

```bash
# See what you changed
git status
git diff

# Stage changes
git add .

# Commit with a clear message
git commit -m "Add Jest tests for database module"
```

**Commit message format:**
- First line: short summary (50 chars max)
- Blank line
- Details if needed (bullet points, context)

Good examples:
```
Add Jest tests for database module
Fix card ID generation race condition
Update Sushi Ken → Sushi Ren
```

### Pushing and creating a PR

```bash
# Push your branch
git push -u origin feature/add-jest-tests

# GitHub will print a link to create a PR
# Or go to: https://github.com/hoserR9/school-discount-pass/compare
```

In the PR:
1. Write a title and description
2. Reference the task/issue you're solving
3. Request a review
4. Wait for approval before merging

### After PR is merged

```bash
# Back to main
git checkout main
git pull origin main

# Delete your branch locally
git branch -d feature/add-jest-tests
```

---

## Running Tests

Currently there are no automated tests (see Priority 1 in `TASKS.md`).

Manual smoke test:

```bash
npm start

# In another terminal:
curl http://localhost:3000/                    # Should return HTML
curl http://localhost:3000/api/stats            # Should return JSON
curl -o test.pkpass http://localhost:3000/pass  # Should download pass
```

See `docs/TESTING.md` for the full test plan.

---

## Using Claude Code

Claude Code can speed up your work significantly. Run it in the project directory:

```bash
cd school-discount-pass
claude
```

Good prompts to try:
- "Add Jest tests for the database module"
- "Review the security of the admin routes"
- "Help me add basic auth to /admin"
- "Explain how the Apple Wallet web service endpoints work"

---

## Common Tasks

### Add a new sponsor logo

1. Place PNG in `design/sponsor-logos/`
2. Re-run the card back generator (script exists in conversations)
3. Update `src/generate-pass.js` buildBackFields if adding to pass
4. Update the sponsor list in `seed-sponsors.js`

### Add a new POS integration

1. Create `src/integrations/{posname}.js` following the pattern of existing ones
2. Export a `validateFor{POSName}` function
3. Register it in `src/integrations/index.js`
4. Add it to `getSupportedPOSTypes()`

### Run a database query locally

```bash
# Install sqlite3 CLI
brew install sqlite3

# Open the database
sqlite3 data/cards.db

# List tables
.tables

# Query
SELECT * FROM cards LIMIT 5;
```

---

## Questions?

- Read the README and other docs first
- Check `docs/TESTING.md` for how to verify things work
- Open a GitHub Issue for questions or bug reports
- Tag the issue with `question` or `help wanted`

Welcome to the project!
