# Dev Environment Setup — VS Code + Xcode + Claude Code

This document walks through installing and configuring the full development environment for the Nighthawk Card project.

**What you'll install:**
- **VS Code** — primary editor for Node.js, HTML, server code
- **Xcode** — secondary editor for the SwiftUI iOS app only
- **Claude Code** — AI coding assistant (runs in terminal, has VS Code extension)
- **Node.js** — runtime for the backend server
- **Homebrew** — Mac package manager

Estimated time: **60 minutes** (Xcode download takes the longest)

---

## Part 1: Install VS Code (10 minutes)

### Step 1: Download and install
1. Go to https://code.visualstudio.com/
2. Click **Download for Mac**
3. Open the downloaded .zip, drag **Visual Studio Code** to your **Applications** folder
4. Open VS Code (right-click → Open the first time to bypass the security warning)

### Step 2: Enable the `code` command in Terminal
This lets you open folders in VS Code from the command line:
1. Open VS Code
2. Press `Cmd+Shift+P` to open the Command Palette
3. Type: `Shell Command: Install 'code' command in PATH`
4. Click it

Verify it works:
```bash
code --version
```

### Step 3: Install essential extensions
Open VS Code, click the **Extensions icon** in the left sidebar (or press `Cmd+Shift+X`), search for and install each of these:

| Extension | Why you need it |
|-----------|-----------------|
| **Claude Code** (by Anthropic) | AI assistant integrated into the editor |
| **ESLint** | Catches JavaScript errors as you type |
| **Prettier - Code formatter** | Auto-formats code on save |
| **GitLens** | Better Git features (blame, history, diffs) |
| **SQLite Viewer** | View the cards.db database |
| **npm Intellisense** | Autocomplete for import paths |

### Step 4: Configure auto-formatting
1. Press `Cmd+,` to open Settings
2. Search for `format on save`
3. Check the box: **Editor: Format On Save**
4. Search for `default formatter`
5. Set: **Prettier - Code formatter**

Now every time you save, your code auto-formats.

---

## Part 2: Install Homebrew + Node.js (10 minutes)

### Step 1: Install Homebrew
Open Terminal and paste:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. You may need to enter your Mac password.

### Step 2: Install Node.js
```bash
brew install node
```

### Step 3: Verify
```bash
node --version    # should show v18.0.0 or higher
npm --version     # should show 9.0.0 or higher
```

---

## Part 3: Install Claude Code CLI (5 minutes)

### Step 1: Install Claude Code globally
```bash
npm install -g @anthropic-ai/claude-code
```

### Step 2: Test it
```bash
claude --version
```

### Step 3: Sign in
The first time you run `claude` in a project, it'll prompt you to sign in with your Anthropic account.

---

## Part 4: Clone and Run the Project (5 minutes)

### Step 1: Clone the repo
```bash
cd ~
mkdir -p claude
cd claude
git clone https://github.com/hoserR9/school-discount-pass.git
cd school-discount-pass
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Open in VS Code
```bash
code .
```

### Step 4: Start the server
In VS Code, open the integrated terminal with ``Cmd+` `` (that's Cmd plus the backtick key, above Tab).

Run:
```bash
npm start
```

You should see:
```
Del Norte Nighthawk Discount Pass server running at http://localhost:3000
```

Open http://localhost:3000 in your browser. You'll see the Nighthawk card page.

### Step 5: Start Claude Code in the terminal
Open a second terminal tab in VS Code (``Ctrl+Shift+` ``) and run:
```bash
claude
```

Now you can ask Claude questions about the code.

---

## Part 5: Install Xcode (for iOS work only — 30-60 minutes)

You only need Xcode when editing the SwiftUI iOS app in `DelNorteFootballApp/`. You can skip this until you actually need it.

### Step 1: Download Xcode from the App Store
1. Open the **App Store** on your Mac
2. Search for **Xcode**
3. Click **Get** → **Install** (free, but ~15 GB)
4. Wait for it to download and install (30-60 minutes)

### Step 2: Accept the license and install command line tools
```bash
sudo xcodebuild -license accept
sudo xcode-select --install
```

### Step 3: Open the iOS project
```bash
cd ~/claude/school-discount-pass
open DelNorteFootball.xcworkspace
```

### Step 4: Sign in to Xcode with your Apple ID
1. Xcode → Settings → Accounts
2. Click **+** → Add Apple ID
3. Sign in with your Apple Developer account

### Step 5: Download an iOS simulator
1. Xcode → Settings → Platforms
2. Click **+** to download **iOS 17** or **iOS 18** simulator runtime

### Step 6: Test the app
1. At the top of Xcode, select a simulator (e.g., **iPhone 17**)
2. Click the **Play button** (or press `Cmd+R`)
3. The Nighthawk app launches in the iOS simulator

---

## Daily Workflow

```bash
# Morning
cd ~/claude/school-discount-pass
git checkout main
git pull
code .                              # Open in VS Code

# In VS Code:
# 1. Open terminal: Cmd+`
# 2. Create branch: git checkout -b feature/my-task
# 3. Start server: npm start
# 4. Open second terminal tab, run: claude
# 5. Edit files in the editor
# 6. Test in browser: http://localhost:3000
# 7. Commit changes: git add . && git commit -m "..."
# 8. Push: git push -u origin feature/my-task
# 9. Open Pull Request on GitHub
```

---

## VS Code Keyboard Shortcuts (Learn These)

| Action | Shortcut |
|--------|----------|
| Command Palette | `Cmd+Shift+P` |
| Open integrated terminal | ``Cmd+` `` |
| Quick open file | `Cmd+P` |
| Search across all files | `Cmd+Shift+F` |
| Go to definition | `F12` or `Cmd+Click` |
| Find all references | `Shift+F12` |
| Format document | `Shift+Option+F` |
| Save | `Cmd+S` |
| Multi-cursor | `Option+Click` |
| New terminal tab | ``Ctrl+Shift+` `` |
| Toggle sidebar | `Cmd+B` |

---

## Troubleshooting

### "code: command not found"
Redo Part 1 Step 2 (install shell command in PATH).

### "brew: command not found"
Install Homebrew — Part 2 Step 1. After install, you may need to add Homebrew to your PATH (the installer tells you the exact commands).

### "npm install" fails with EACCES permissions error
Don't use `sudo`. Fix with:
```bash
sudo chown -R $(whoami) ~/.npm
```

### Claude Code won't start
```bash
# Reinstall
npm install -g @anthropic-ai/claude-code

# Then sign in
claude
```

### Xcode says "Could not locate device support files"
1. Xcode → Settings → Platforms
2. Download the correct iOS version simulator

### Port 3000 already in use
Another app is using port 3000. Find and kill it:
```bash
lsof -ti:3000 | xargs kill -9
```

---

## Optional: Productivity Extensions

Once you're comfortable, install these for a better experience:

- **Error Lens** — shows errors inline next to the code
- **Path Intellisense** — autocomplete file paths
- **Better Comments** — color-code comments (TODO, FIXME, etc.)
- **Thunder Client** — test API endpoints inside VS Code (alternative to curl)
- **Live Share** — pair programming with someone remote

---

## When Should I Use Xcode vs VS Code?

| File type | Use |
|-----------|-----|
| `*.js`, `*.ts` | VS Code |
| `*.html`, `*.css` | VS Code |
| `*.json`, `*.md` | VS Code |
| `server.js`, `src/*` | VS Code |
| `public/*` | VS Code |
| `*.swift` | Xcode |
| `*.xcodeproj/*` | Xcode |
| `DelNorteFootballApp/*` | Xcode |

**95% of this project is Node.js/web — you'll mostly use VS Code.** Xcode only comes out when touching the iOS app.
