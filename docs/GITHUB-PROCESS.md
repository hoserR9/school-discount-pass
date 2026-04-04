# GitHub Process — Nighthawk Card Project

This document covers the Git and GitHub workflow for contributing to the project.

**Prerequisites:**
- You've been added as a collaborator to https://github.com/hoserR9/school-discount-pass
- You have the repo cloned locally (see `DEV-ENVIRONMENT-SETUP.md`)
- You know basic terminal commands

---

## The 6-Step Workflow

Every single task follows this flow:

1. **Pick a task** from GitHub Issues or `docs/TASKS.md`
2. **Create a branch** off of main
3. **Make changes** and commit as you go
4. **Push branch** to GitHub
5. **Open a Pull Request** and request review
6. **Merge** after approval, delete the branch

---

## Step-by-Step Commands

### Step 1: Start from a clean main

```bash
cd ~/claude/school-discount-pass
git checkout main
git pull origin main
```

This ensures you're building on the latest code.

### Step 2: Create a feature branch

```bash
git checkout -b feature/short-description
```

**Branch naming:**
- `feature/add-jest-tests` — new feature
- `fix/broken-terms-route` — bug fix
- `docs/update-readme` — documentation
- `refactor/cleanup-database` — code cleanup

Use **kebab-case**, keep it under 40 characters, describe what you're doing.

### Step 3: Make changes and commit

Edit files in VS Code. Save frequently. Commit when you finish a logical unit of work.

```bash
# See what you changed
git status
git diff

# Stage specific files
git add server.js src/database.js

# Or stage everything
git add .

# Commit with a clear message
git commit -m "Add Jest tests for database module"
```

### Step 4: Push to GitHub

```bash
# First time pushing a new branch
git push -u origin feature/short-description

# After that, just
git push
```

### Step 5: Open a Pull Request

GitHub prints a URL after you push. Or:
1. Go to https://github.com/hoserR9/school-discount-pass
2. Click **Pull requests** tab
3. Click **New pull request**
4. Select your branch as "compare"
5. Fill in the title and description
6. Click **Create pull request**
7. Request review from your teammate

**Good PR titles:**
- "Add Jest tests for database module"
- "Fix /terms route returning 404"
- "Add Clover POS integration"

**Good PR descriptions:**
```
## What this does
Adds unit tests for the database module using Jest.

## Why
We had no automated regression coverage. Now changes to database.js
can be verified before merging.

## Testing
- Ran `npm test`, all 24 tests pass
- Coverage: 87%

## Closes
#5
```

### Step 6: Merge and clean up

After your PR is approved:
1. Click **Merge pull request** on GitHub
2. Click **Delete branch** to clean up

Then locally:
```bash
git checkout main
git pull origin main
git branch -d feature/short-description
```

---

## Writing Good Commits

### Format
```
Short summary (50 chars or less)

Optional longer description. What changed and why.
Can be multiple lines. Use bullets if helpful:
- Bullet 1
- Bullet 2
```

### Good examples
```
Add Jest tests for database module
Fix card ID generation race condition
Update Sushi Ken to Sushi Ren across all files
Remove unused sponsor logo placeholder files
```

### Bad examples
```
update
wip
asdf
stuff
fix
```

### Rules
- **Imperative mood**: "Add X" not "Added X" or "Adds X"
- **No period** at the end of the summary
- **Under 50 chars** for the first line
- **Be specific**: "Fix null pointer in scan handler" beats "Fix bug"

---

## Branch Protection Rules

The `main` branch is **protected**. This means:

- ❌ You **cannot push directly** to main
- ❌ Your PR **cannot be merged** until someone approves it
- ✅ Everything goes through Pull Requests
- ✅ At least 1 review required before merging

This keeps main stable and prevents accidents.

---

## Pull Request Checklist

### As the author, before requesting review:
- [ ] Code works locally (`npm start` shows no errors)
- [ ] Manual smoke test done (click around, test the feature)
- [ ] No secrets in code (API keys, passwords)
- [ ] Commit messages are clear
- [ ] Linked the GitHub Issue if applicable (`Closes #5`)
- [ ] Added/updated tests if applicable
- [ ] Updated documentation if applicable

### As the reviewer:
- [ ] Read the description, understand the goal
- [ ] Look at the "Files changed" tab
- [ ] Check for secrets, bugs, scope creep
- [ ] Run it locally for big changes
- [ ] Leave specific, actionable comments
- [ ] Approve or Request Changes

---

## How to Review Someone's PR

### 1. Click the PR link in your email or GitHub notifications

### 2. Read the description
Does it match what was asked for? Is anything unclear?

### 3. Look at "Files changed"
See what actually changed. Look for:
- **Secrets** — API keys, passwords in code (should be env vars)
- **Bugs** — obvious logic errors
- **Scope creep** — is this PR doing too much?
- **Style** — does it match existing code patterns?

### 4. (Optional) Test locally
For big changes:
```bash
git fetch origin
git checkout feature/their-branch-name
npm install
npm start
# Test it in your browser
```

### 5. Leave comments
Click a specific line to leave a comment. Be specific and kind.

**Good comments:**
- "Nice — could you add a test for this?"
- "Should this handle the null case?"
- "Small nit: can you rename this variable for clarity?"

**Bad comments:**
- "Looks bad"
- "Why?"
- "No"

### 6. Approve or Request Changes
- **Approve** if it's ready to merge
- **Request Changes** if something must be fixed
- **Comment** for general feedback without blocking

---

## Handling Merge Conflicts

Sometimes main changes while you're working on your branch. You need to sync.

```bash
# Save your work
git add .
git commit -m "WIP: save progress"

# Sync with latest main
git checkout main
git pull origin main
git checkout feature/my-task
git merge main

# If there are conflicts, VS Code highlights them
# Fix each conflicted file, then:
git add .
git commit -m "Resolve merge conflicts"
git push
```

---

## Common Git Commands

| Command | What it does |
|---------|--------------|
| `git status` | Show what's changed |
| `git diff` | Show the actual changes |
| `git add <file>` | Stage a specific file |
| `git add .` | Stage all changes |
| `git commit -m "..."` | Create a commit |
| `git push` | Upload to GitHub |
| `git pull` | Download latest from GitHub |
| `git checkout <branch>` | Switch to a branch |
| `git checkout -b <branch>` | Create and switch to new branch |
| `git branch` | List local branches |
| `git log --oneline -10` | Show last 10 commits |
| `git reset HEAD~1` | Undo last commit (keeps changes) |
| `git stash` | Temporarily save uncommitted changes |
| `git stash pop` | Restore stashed changes |

---

## Troubleshooting

### "Your branch is behind origin/main"
```bash
git pull origin main
```

### "Your branch has diverged"
Someone else pushed to your branch. Pull and merge:
```bash
git pull
```

### "Permission denied (publickey)"
You need to set up SSH keys with GitHub:
https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### "Please enter a commit message"
You're stuck in the vim editor. Press `i` to edit, type your message, press `Esc`, type `:wq`, press Enter.

### Made a commit on the wrong branch
```bash
# Still on wrong branch, undo the commit (keeps changes)
git reset HEAD~1

# Switch to correct branch
git checkout correct-branch-name

# Stage and commit on the correct branch
git add .
git commit -m "..."
```

### Want to discard all local changes
**Warning: this is destructive**
```bash
git checkout .
git clean -fd
```

---

## Rules to Live By

1. **Never push to main directly** — always through PRs
2. **Never commit secrets** — use environment variables
3. **Keep PRs small** — one task per PR
4. **Write clear commits** — others will read them
5. **Test before pushing** — `npm start` should work
6. **Review PRs within 24 hours** — don't block teammates
7. **Ask questions** — via PR comments, not guesses
