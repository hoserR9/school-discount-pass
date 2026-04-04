/**
 * Generate the Dev Environment Setup deck and regenerate the
 * main Engineer Onboarding deck with links to the other two.
 */
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const {
  FaCode, FaTerminal, FaRobot, FaApple, FaDownload, FaCheckCircle,
  FaRocket, FaBook, FaGithub, FaFootballBall, FaCodeBranch,
} = require("react-icons/fa");

const NAVY = "002D62";
const GOLD = "C5A55A";
const DARK_NAVY = "001A3A";
const WHITE = "FFFFFF";
const OFF_WHITE = "F5F0E6";
const LIGHT_GRAY = "A0A0A0";
const LIGHT_GOLD = "D4B96A";

const EXPORTS_DIR = path.resolve(__dirname, "../design/canva-exports");

function renderIconSvg(Icon, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(Icon, { color, size: String(size) }));
}
async function iconPng(Icon, color, size = 256) {
  const svg = renderIconSvg(Icon, color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
async function imgToBase64(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buf = fs.readFileSync(filePath);
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `${mime};base64,` + buf.toString("base64");
}
const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.2 });

// ══════════════════════════════════════════════════════════════
// DEV ENVIRONMENT SETUP DECK
// ══════════════════════════════════════════════════════════════
async function buildEnvDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Nighthawk — Dev Environment Setup";

  const dnLogo = await imgToBase64(path.join(EXPORTS_DIR, "08-dn-nighthawk-logo-transparent.png"));
  const icons = {
    code: await iconPng(FaCode, `#${GOLD}`),
    terminal: await iconPng(FaTerminal, `#${GOLD}`),
    robot: await iconPng(FaRobot, `#${GOLD}`),
    apple: await iconPng(FaApple, `#${GOLD}`),
    download: await iconPng(FaDownload, `#${GOLD}`),
    check: await iconPng(FaCheckCircle, `#${GOLD}`),
    navyCode: await iconPng(FaCode, `#${NAVY}`),
    navyTerminal: await iconPng(FaTerminal, `#${NAVY}`),
    navyRobot: await iconPng(FaRobot, `#${NAVY}`),
    navyApple: await iconPng(FaApple, `#${NAVY}`),
  };

  // Slide 1: Title
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: dnLogo, x: 7.5, y: 0.3, w: 2.2, h: 1.3, sizing: { type: "contain", w: 2.2, h: 1.3 } });
    s.addImage({ data: icons.code, x: 0.8, y: 1.0, w: 1.0, h: 1.0 });
    s.addText("DEV ENVIRONMENT SETUP", { x: 0.8, y: 2.2, w: 8, h: 0.8, fontSize: 36, fontFace: "Arial Black", bold: true, color: WHITE, margin: 0 });
    s.addText("VS Code + Xcode + Claude Code", { x: 0.8, y: 3.0, w: 8, h: 0.5, fontSize: 20, fontFace: "Arial", color: GOLD, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.6, w: 2.5, h: 0.04, fill: { color: GOLD } });
    s.addText("Everything you need to start building.", { x: 0.8, y: 3.9, w: 8, h: 0.4, fontSize: 14, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });
    s.addText("Full instructions: docs/DEV-ENVIRONMENT-SETUP.md", { x: 0.8, y: 4.5, w: 8, h: 0.3, fontSize: 10, fontFace: "monospace", color: GOLD, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // Slide 2: The Stack Overview
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WHAT YOU'LL INSTALL", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const tools = [
      { icon: icons.navyCode, name: "VS Code", role: "Primary editor for Node.js, HTML, server code", when: "Every day" },
      { icon: icons.navyApple, name: "Xcode", role: "Editor for SwiftUI iOS app only", when: "Occasional" },
      { icon: icons.navyRobot, name: "Claude Code", role: "AI assistant (CLI + VS Code extension)", when: "Every day" },
      { icon: icons.navyTerminal, name: "Node.js", role: "Runtime for running the server", when: "Always" },
    ];
    tools.forEach((tool, i) => {
      const y = 1.3 + i * 0.95;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.82, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.82, fill: { color: GOLD } });
      s.addImage({ data: tool.icon, x: 0.9, y: y + 0.2, w: 0.42, h: 0.42 });
      s.addText(tool.name, { x: 1.5, y: y + 0.1, w: 2.5, h: 0.35, fontSize: 15, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText(tool.role, { x: 1.5, y: y + 0.4, w: 5.5, h: 0.35, fontSize: 11, fontFace: "Arial", color: "555555", margin: 0 });
      s.addText(tool.when, { x: 7.2, y, w: 2, h: 0.82, fontSize: 11, fontFace: "Arial", bold: true, italic: true, color: GOLD, align: "right", valign: "middle", margin: 0 });
    });
  }

  // Slide 3: VS Code Setup
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.code, x: 0.8, y: 0.35, w: 0.5, h: 0.5 });
    s.addText("VS CODE SETUP", { x: 1.5, y: 0.35, w: 8, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("10 minutes", { x: 8.2, y: 0.45, w: 1.4, h: 0.3, fontSize: 11, fontFace: "Arial", italic: true, color: LIGHT_GOLD, align: "right", margin: 0 });

    const steps = [
      { n: "1", title: "Download VS Code", cmd: "code.visualstudio.com" },
      { n: "2", title: "Install 'code' command", cmd: "Cmd+Shift+P → \"Shell Command: Install code in PATH\"" },
      { n: "3", title: "Install Claude Code extension", cmd: "Search 'Claude Code' in Extensions sidebar" },
      { n: "4", title: "Install ESLint + Prettier", cmd: "Search in Extensions, install both" },
      { n: "5", title: "Enable format on save", cmd: "Settings → 'format on save' → check" },
    ];
    steps.forEach((step, i) => {
      const y = 1.1 + i * 0.78;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.68, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.OVAL, { x: 0.8, y: y + 0.14, w: 0.4, h: 0.4, fill: { color: GOLD } });
      s.addText(step.n, { x: 0.8, y: y + 0.14, w: 0.4, h: 0.4, fontSize: 16, fontFace: "Arial Black", bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
      s.addText(step.title, { x: 1.35, y: y + 0.05, w: 7.8, h: 0.3, fontSize: 13, fontFace: "Arial", bold: true, color: WHITE, margin: 0 });
      s.addText(step.cmd, { x: 1.35, y: y + 0.35, w: 7.8, h: 0.28, fontSize: 10, fontFace: "monospace", color: LIGHT_GRAY, margin: 0 });
    });
  }

  // Slide 4: Node.js + Homebrew
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("NODE.JS + HOMEBREW", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("10 minutes", { x: 8.2, y: 0.4, w: 1.4, h: 0.3, fontSize: 11, fontFace: "Arial", italic: true, color: LIGHT_GOLD, align: "right", margin: 0 });

    // Homebrew
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.3, w: 8.8, h: 1.4, fill: { color: OFF_WHITE }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.3, w: 0.07, h: 1.4, fill: { color: GOLD } });
    s.addText("1. Install Homebrew (Mac package manager)", { x: 0.9, y: 1.4, w: 8.2, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
    s.addText('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"', { x: 0.9, y: 1.8, w: 8.2, h: 0.4, fontSize: 10, fontFace: "monospace", color: "333333", margin: 0 });
    s.addText("Paste into Terminal, enter your Mac password when prompted.", { x: 0.9, y: 2.3, w: 8.2, h: 0.3, fontSize: 11, fontFace: "Arial", italic: true, color: "666666", margin: 0 });

    // Node
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.9, w: 8.8, h: 1.2, fill: { color: OFF_WHITE }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.9, w: 0.07, h: 1.2, fill: { color: GOLD } });
    s.addText("2. Install Node.js", { x: 0.9, y: 3.0, w: 8.2, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
    s.addText("brew install node", { x: 0.9, y: 3.4, w: 8.2, h: 0.35, fontSize: 12, fontFace: "monospace", color: "333333", margin: 0 });

    // Verify
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.3, w: 8.8, h: 1.0, fill: { color: OFF_WHITE }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.3, w: 0.07, h: 1.0, fill: { color: GOLD } });
    s.addText("3. Verify", { x: 0.9, y: 4.4, w: 8.2, h: 0.3, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
    s.addText("node --version    # should show v18.0.0 or higher", { x: 0.9, y: 4.75, w: 8.2, h: 0.25, fontSize: 11, fontFace: "monospace", color: "333333", margin: 0 });
    s.addText("npm --version     # should show 9.0.0 or higher", { x: 0.9, y: 5.0, w: 8.2, h: 0.25, fontSize: 11, fontFace: "monospace", color: "333333", margin: 0 });
  }

  // Slide 5: Claude Code Setup
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.robot, x: 0.8, y: 0.35, w: 0.5, h: 0.5 });
    s.addText("CLAUDE CODE", { x: 1.5, y: 0.35, w: 8, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("5 minutes", { x: 8.2, y: 0.45, w: 1.4, h: 0.3, fontSize: 11, fontFace: "Arial", italic: true, color: LIGHT_GOLD, align: "right", margin: 0 });

    s.addText("Two ways to use Claude Code:", { x: 0.8, y: 1.1, w: 8.4, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: WHITE, margin: 0 });

    // CLI
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.6, w: 4.3, h: 2.2, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.6, w: 4.3, h: 0.06, fill: { color: GOLD } });
    s.addText("CLI (Terminal)", { x: 0.9, y: 1.75, w: 3.8, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    s.addText("Install:", { x: 0.9, y: 2.15, w: 3.8, h: 0.25, fontSize: 11, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    s.addText("npm install -g", { x: 0.9, y: 2.4, w: 3.8, h: 0.25, fontSize: 10, fontFace: "monospace", color: WHITE, margin: 0 });
    s.addText("  @anthropic-ai/claude-code", { x: 0.9, y: 2.62, w: 3.8, h: 0.25, fontSize: 10, fontFace: "monospace", color: WHITE, margin: 0 });
    s.addText("Use:", { x: 0.9, y: 3.0, w: 3.8, h: 0.25, fontSize: 11, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    s.addText("cd project && claude", { x: 0.9, y: 3.25, w: 3.8, h: 0.25, fontSize: 10, fontFace: "monospace", color: WHITE, margin: 0 });
    s.addText("Sign in with Anthropic account", { x: 0.9, y: 3.55, w: 3.8, h: 0.2, fontSize: 9, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });

    // VS Code Extension
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.6, w: 4.3, h: 2.2, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.6, w: 4.3, h: 0.06, fill: { color: GOLD } });
    s.addText("VS Code Extension", { x: 5.4, y: 1.75, w: 3.8, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    s.addText("Install:", { x: 5.4, y: 2.15, w: 3.8, h: 0.25, fontSize: 11, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    s.addText('Search "Claude Code"', { x: 5.4, y: 2.4, w: 3.8, h: 0.25, fontSize: 10, fontFace: "monospace", color: WHITE, margin: 0 });
    s.addText("  in Extensions sidebar", { x: 5.4, y: 2.62, w: 3.8, h: 0.25, fontSize: 10, fontFace: "monospace", color: WHITE, margin: 0 });
    s.addText("Use:", { x: 5.4, y: 3.0, w: 3.8, h: 0.25, fontSize: 11, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
    s.addText("Click the Claude icon", { x: 5.4, y: 3.25, w: 3.8, h: 0.25, fontSize: 10, fontFace: "monospace", color: WHITE, margin: 0 });
    s.addText("Knows which file you're viewing", { x: 5.4, y: 3.55, w: 3.8, h: 0.2, fontSize: 9, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });

    s.addText("Recommended: use BOTH — CLI for complex tasks, extension for quick questions", { x: 0.8, y: 4.1, w: 8.4, h: 0.35, fontSize: 12, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });
  }

  // Slide 6: Clone the Project
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("CLONE THE PROJECT", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("5 minutes", { x: 8.2, y: 0.4, w: 1.4, h: 0.3, fontSize: 11, fontFace: "Arial", italic: true, color: LIGHT_GOLD, align: "right", margin: 0 });

    const commands = [
      { step: "Create folder", cmd: "cd ~ && mkdir -p claude && cd claude" },
      { step: "Clone repo", cmd: "git clone https://github.com/hoserR9/school-discount-pass.git" },
      { step: "Enter project", cmd: "cd school-discount-pass" },
      { step: "Install deps", cmd: "npm install" },
      { step: "Open in VS Code", cmd: "code ." },
      { step: "Start server", cmd: "npm start" },
    ];
    commands.forEach((c, i) => {
      const y = 1.3 + i * 0.6;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.5, fill: { color: i % 2 === 0 ? OFF_WHITE : WHITE } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.5, fill: { color: GOLD } });
      s.addText(c.step, { x: 0.9, y, w: 2.0, h: 0.5, fontSize: 12, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0 });
      s.addText(c.cmd, { x: 3.0, y, w: 6.2, h: 0.5, fontSize: 11, fontFace: "monospace", color: "333333", valign: "middle", margin: 0 });
    });

    s.addText("After 'npm start', open http://localhost:3000 in your browser.", { x: 0.8, y: 5.0, w: 8.4, h: 0.35, fontSize: 12, fontFace: "Arial", italic: true, color: NAVY, margin: 0 });
  }

  // Slide 7: Xcode (Optional)
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.apple, x: 0.8, y: 0.35, w: 0.5, h: 0.5 });
    s.addText("XCODE (iOS APP ONLY)", { x: 1.5, y: 0.35, w: 7, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("30-60 min download", { x: 7.6, y: 0.45, w: 2, h: 0.3, fontSize: 11, fontFace: "Arial", italic: true, color: LIGHT_GOLD, align: "right", margin: 0 });

    s.addText("You only need Xcode for the SwiftUI iOS app (~5% of the project).", { x: 0.8, y: 1.1, w: 8.4, h: 0.35, fontSize: 14, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });

    const steps = [
      { n: "1", title: "Install from App Store", desc: "Search 'Xcode' in App Store, click Get (~15 GB)" },
      { n: "2", title: "Accept license", desc: "sudo xcodebuild -license accept" },
      { n: "3", title: "Sign in with Apple ID", desc: "Xcode → Settings → Accounts → Add Apple ID" },
      { n: "4", title: "Install iOS simulator", desc: "Xcode → Settings → Platforms → Download iOS 17+" },
      { n: "5", title: "Open the workspace", desc: "open DelNorteFootball.xcworkspace" },
    ];
    steps.forEach((step, i) => {
      const y = 1.6 + i * 0.68;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.58, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.OVAL, { x: 0.8, y: y + 0.09, w: 0.4, h: 0.4, fill: { color: GOLD } });
      s.addText(step.n, { x: 0.8, y: y + 0.09, w: 0.4, h: 0.4, fontSize: 16, fontFace: "Arial Black", bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
      s.addText(step.title, { x: 1.35, y: y + 0.05, w: 7.8, h: 0.3, fontSize: 13, fontFace: "Arial", bold: true, color: WHITE, margin: 0 });
      s.addText(step.desc, { x: 1.35, y: y + 0.32, w: 7.8, h: 0.25, fontSize: 10, fontFace: "monospace", color: LIGHT_GRAY, margin: 0 });
    });
  }

  // Slide 8: Which Editor for Which File?
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WHICH EDITOR FOR WHICH FILE?", { x: 0.8, y: 0.25, w: 9, h: 0.6, fontSize: 26, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    // VS Code column
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.3, w: 4.3, h: 3.8, fill: { color: OFF_WHITE }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.3, w: 4.3, h: 0.06, fill: { color: "1a7a1a" } });
    s.addImage({ data: icons.navyCode, x: 0.9, y: 1.5, w: 0.4, h: 0.4 });
    s.addText("VS CODE", { x: 1.4, y: 1.5, w: 3, h: 0.4, fontSize: 16, fontFace: "Arial Black", bold: true, color: NAVY, margin: 0 });
    s.addText("~95% of your work", { x: 0.9, y: 1.95, w: 3.8, h: 0.3, fontSize: 11, fontFace: "Arial", italic: true, color: "888888", margin: 0 });
    const vscodeFiles = [".js, .ts", ".html, .css", ".json, .md", "server.js", "src/*", "public/*", "docs/*"];
    vscodeFiles.forEach((f, i) => {
      s.addText("  • " + f, { x: 0.9, y: 2.35 + i * 0.35, w: 3.8, h: 0.3, fontSize: 12, fontFace: "monospace", color: "333333", margin: 0 });
    });

    // Xcode column
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.3, w: 4.3, h: 3.8, fill: { color: OFF_WHITE }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.3, w: 4.3, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.navyApple, x: 5.4, y: 1.5, w: 0.4, h: 0.4 });
    s.addText("XCODE", { x: 5.9, y: 1.5, w: 3, h: 0.4, fontSize: 16, fontFace: "Arial Black", bold: true, color: NAVY, margin: 0 });
    s.addText("~5% of your work", { x: 5.4, y: 1.95, w: 3.8, h: 0.3, fontSize: 11, fontFace: "Arial", italic: true, color: "888888", margin: 0 });
    const xcodeFiles = [".swift", ".xcodeproj/*", ".xcworkspace/*", "DelNorteFootballApp/*"];
    xcodeFiles.forEach((f, i) => {
      s.addText("  • " + f, { x: 5.4, y: 2.35 + i * 0.35, w: 3.8, h: 0.3, fontSize: 12, fontFace: "monospace", color: "333333", margin: 0 });
    });
  }

  // Slide 9: Essential VS Code Shortcuts
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("VS CODE SHORTCUTS TO LEARN", { x: 0.8, y: 0.35, w: 9, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const shortcuts = [
      ["Cmd+Shift+P", "Command Palette"],
      ["Cmd+`", "Integrated terminal"],
      ["Cmd+P", "Quick open file"],
      ["Cmd+Shift+F", "Search across all files"],
      ["F12 / Cmd+Click", "Go to definition"],
      ["Shift+F12", "Find all references"],
      ["Shift+Option+F", "Format document"],
      ["Cmd+S", "Save"],
      ["Option+Click", "Multi-cursor"],
      ["Ctrl+Shift+`", "New terminal tab"],
    ];
    shortcuts.forEach((sc, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.6 + col * 4.5;
      const y = 1.1 + row * 0.68;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.3, h: 0.58, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h: 0.58, fill: { color: GOLD } });
      s.addText(sc[0], { x: x + 0.2, y, w: 1.8, h: 0.58, fontSize: 11, fontFace: "monospace", bold: true, color: GOLD, valign: "middle", margin: 0 });
      s.addText(sc[1], { x: x + 2.0, y, w: 2.2, h: 0.58, fontSize: 11, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0 });
    });
  }

  // Slide 10: Verification Test
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("VERIFY EVERYTHING WORKS", { x: 0.8, y: 0.25, w: 8.4, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const tests = [
      { test: "Run the server", expected: "npm start → opens http://localhost:3000 in browser" },
      { test: "Edit a file", expected: "Change text in public/index.html, save, refresh browser" },
      { test: "Use Claude Code", expected: "Type 'claude' in terminal, ask about server.js" },
      { test: "Check Git", expected: "git status → shows branch and changes" },
      { test: "Open Xcode project", expected: "open DelNorteFootball.xcworkspace → Xcode opens" },
    ];
    tests.forEach((t, i) => {
      const y = 1.4 + i * 0.72;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.62, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addImage({ data: icons.check, x: 0.8, y: y + 0.11, w: 0.4, h: 0.4 });
      s.addText(t.test, { x: 1.4, y: y + 0.05, w: 7.8, h: 0.3, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText(t.expected, { x: 1.4, y: y + 0.33, w: 7.8, h: 0.27, fontSize: 10, fontFace: "monospace", color: "555555", margin: 0 });
    });
  }

  // Slide 11: You're Ready
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.check, x: 4.5, y: 1.0, w: 1.0, h: 1.0 });
    s.addText("YOU'RE READY TO BUILD", { x: 0.8, y: 2.4, w: 8.4, h: 0.6, fontSize: 32, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.2, w: 3.0, h: 0.04, fill: { color: GOLD } });
    s.addText("Environment set up. Time to write some code.", { x: 0.8, y: 3.5, w: 8.4, h: 0.4, fontSize: 16, fontFace: "Arial", italic: true, color: WHITE, align: "center", margin: 0 });
    s.addText("Next: Read the GitHub Process deck to learn the workflow.", { x: 0.8, y: 4.1, w: 8.4, h: 0.35, fontSize: 13, fontFace: "Arial", color: LIGHT_GOLD, align: "center", margin: 0 });
    s.addText("Full reference: docs/DEV-ENVIRONMENT-SETUP.md", { x: 0.8, y: 4.8, w: 8.4, h: 0.3, fontSize: 11, fontFace: "monospace", color: LIGHT_GRAY, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  await pres.writeFile({ fileName: path.resolve(__dirname, "Del-Norte-Dev-Environment-Setup.pptx") });
  console.log("  Dev Environment Setup deck saved (11 slides)");
}

// ══════════════════════════════════════════════════════════════
// UPDATED ENGINEER ONBOARDING DECK with links
// ══════════════════════════════════════════════════════════════
async function buildOnboardingDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Nighthawk — Engineer Onboarding";

  const dnLogo = await imgToBase64(path.join(EXPORTS_DIR, "08-dn-nighthawk-logo-transparent.png"));
  const icons = {
    rocket: await iconPng(FaRocket, `#${GOLD}`),
    book: await iconPng(FaBook, `#${GOLD}`),
    code: await iconPng(FaCode, `#${GOLD}`),
    github: await iconPng(FaGithub, `#${GOLD}`),
    navyCode: await iconPng(FaCode, `#${NAVY}`),
    navyGithub: await iconPng(FaGithub, `#${NAVY}`),
    navyBook: await iconPng(FaBook, `#${NAVY}`),
    football: await iconPng(FaFootballBall, `#${WHITE}`),
    navyBranch: await iconPng(FaCodeBranch, `#${NAVY}`),
  };

  // Slide 1: Welcome
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: dnLogo, x: 7.5, y: 0.3, w: 2.2, h: 1.3, sizing: { type: "contain", w: 2.2, h: 1.3 } });
    s.addImage({ data: icons.rocket, x: 0.8, y: 1.0, w: 1.0, h: 1.0 });
    s.addText("WELCOME!", { x: 0.8, y: 2.2, w: 8, h: 0.8, fontSize: 44, fontFace: "Arial Black", bold: true, color: WHITE, margin: 0 });
    s.addText("Engineer Onboarding", { x: 0.8, y: 3.0, w: 8, h: 0.5, fontSize: 20, fontFace: "Arial", color: GOLD, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.6, w: 2.5, h: 0.04, fill: { color: GOLD } });
    s.addText("Del Norte Nighthawk Discount Card — Engineering Team", { x: 0.8, y: 3.9, w: 8, h: 0.4, fontSize: 14, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  // Slide 2: What You're Joining
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WHAT YOU'RE JOINING", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    s.addText("A digital discount card system for Del Norte HS Football.", { x: 0.8, y: 1.3, w: 8.4, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
    s.addText("Students buy a physical card. Scan it → get a digital version in Apple Wallet. Show at 11 local businesses → get discounts. All scans tracked, all sponsors get analytics, promotions pushed to cardholders' phones.", { x: 0.8, y: 1.7, w: 8.4, h: 1.0, fontSize: 13, fontFace: "Arial", color: "555555", margin: 0 });

    s.addText("THE TECH STACK", { x: 0.8, y: 2.9, w: 8, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    const stack = [
      { label: "Backend", tech: "Node.js + Express" },
      { label: "Database", tech: "SQLite (better-sqlite3)" },
      { label: "Passes", tech: "passkit-generator + Apple Wallet" },
      { label: "Push", tech: "APNs via hapns" },
      { label: "Host", tech: "Railway.app" },
      { label: "iOS", tech: "SwiftUI + PassKit" },
    ];
    stack.forEach((s2, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.8 + col * 4.3;
      const y = 3.4 + row * 0.55;
      s.addText(s2.label + ":", { x, y, w: 1.3, h: 0.3, fontSize: 12, fontFace: "Arial", bold: true, color: NAVY, margin: 0 });
      s.addText(s2.tech, { x: x + 1.3, y, w: 3.0, h: 0.3, fontSize: 12, fontFace: "Arial", color: "555555", margin: 0 });
    });
  }

  // Slide 3: Your Onboarding Journey (NEW — links to other decks)
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("YOUR ONBOARDING JOURNEY", { x: 0.8, y: 0.4, w: 9, h: 0.6, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });
    s.addText("Three decks walk you through everything:", { x: 0.8, y: 1.0, w: 8.4, h: 0.35, fontSize: 13, fontFace: "Arial", italic: true, color: LIGHT_GOLD, margin: 0 });

    // Deck 1: This one
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.5, w: 8.8, h: 1.1, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.5, w: 0.1, h: 1.1, fill: { color: GOLD } });
    s.addText("1. Engineer Onboarding (this deck)", { x: 0.9, y: 1.6, w: 8.2, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    s.addText("Project overview, tech stack, first-week goals, where to find things.", { x: 0.9, y: 1.95, w: 8.2, h: 0.3, fontSize: 11, fontFace: "Arial", color: WHITE, margin: 0 });
    s.addText("Start here (you're already here).", { x: 0.9, y: 2.25, w: 8.2, h: 0.25, fontSize: 10, fontFace: "Arial", italic: true, color: LIGHT_GRAY, margin: 0 });

    // Deck 2: Env Setup
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.75, w: 8.8, h: 1.1, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.75, w: 0.1, h: 1.1, fill: { color: GOLD } });
    s.addText("2. Dev Environment Setup", { x: 0.9, y: 2.85, w: 8.2, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    s.addText("Install VS Code, Node.js, Claude Code, Xcode. Run the project locally.", { x: 0.9, y: 3.2, w: 8.2, h: 0.3, fontSize: 11, fontFace: "Arial", color: WHITE, margin: 0 });
    s.addText("File: pitch/Del-Norte-Dev-Environment-Setup.pptx · docs/DEV-ENVIRONMENT-SETUP.md", { x: 0.9, y: 3.5, w: 8.2, h: 0.25, fontSize: 9, fontFace: "monospace", italic: true, color: LIGHT_GRAY, margin: 0 });

    // Deck 3: GitHub Flow
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.0, w: 8.8, h: 1.1, fill: { color: "0A1A35" }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.0, w: 0.1, h: 1.1, fill: { color: GOLD } });
    s.addText("3. GitHub Process", { x: 0.9, y: 4.1, w: 8.2, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: GOLD, margin: 0 });
    s.addText("Branching, commits, pull requests, code review workflow.", { x: 0.9, y: 4.45, w: 8.2, h: 0.3, fontSize: 11, fontFace: "Arial", color: WHITE, margin: 0 });
    s.addText("File: pitch/Del-Norte-GitHub-Flow.pptx · docs/GITHUB-PROCESS.md", { x: 0.9, y: 4.75, w: 8.2, h: 0.25, fontSize: 9, fontFace: "monospace", italic: true, color: LIGHT_GRAY, margin: 0 });
  }

  // Slide 4: Project Structure
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("PROJECT STRUCTURE", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const paths = [
      { path: "server.js", desc: "Main Express server — all API endpoints" },
      { path: "src/generate-pass.js", desc: "Apple Wallet pass generation" },
      { path: "src/database.js", desc: "SQLite layer — cards, scans, sponsors, POS config" },
      { path: "src/push-update.js", desc: "APNs push notifications" },
      { path: "src/integrations/", desc: "POS integrations (Toast, Square, Clover, etc.)" },
      { path: "public/", desc: "HTML pages (admin, sponsor, terms, landing)" },
      { path: "models/discount-card.pass/", desc: "Apple Wallet pass template" },
      { path: "docs/", desc: "All documentation" },
    ];
    paths.forEach((p, i) => {
      const y = 1.3 + i * 0.48;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.4, fill: { color: i % 2 === 0 ? OFF_WHITE : WHITE } });
      s.addText(p.path, { x: 0.9, y, w: 3.5, h: 0.4, fontSize: 12, fontFace: "monospace", bold: true, color: NAVY, valign: "middle", margin: 0 });
      s.addText(p.desc, { x: 4.5, y, w: 4.7, h: 0.4, fontSize: 11, fontFace: "Arial", color: "555555", valign: "middle", margin: 0 });
    });
  }

  // Slide 5: Common Commands
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.code, x: 0.8, y: 0.35, w: 0.5, h: 0.5 });
    s.addText("COMMON COMMANDS", { x: 1.5, y: 0.35, w: 8, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const tasks = [
      { title: "Start the server", cmd: "npm start" },
      { title: "Generate a test pass", cmd: "curl -o test.pkpass http://localhost:3000/pass" },
      { title: "Generate batch cards", cmd: "node generate-batch.js --count 5" },
      { title: "Seed sponsors", cmd: "node seed-sponsors.js" },
      { title: "Query the database", cmd: "sqlite3 data/cards.db" },
      { title: "Rebuild slide decks", cmd: "node pitch/rebuild-decks.js" },
    ];
    tasks.forEach((t, i) => {
      const y = 1.1 + i * 0.68;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.58, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.58, fill: { color: GOLD } });
      s.addText(t.title, { x: 0.9, y, w: 3, h: 0.58, fontSize: 13, fontFace: "Arial", bold: true, color: GOLD, valign: "middle", margin: 0 });
      s.addText(t.cmd, { x: 3.9, y, w: 5.3, h: 0.58, fontSize: 12, fontFace: "monospace", color: WHITE, valign: "middle", margin: 0 });
    });
  }

  // Slide 6: Where to Find Things
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("WHERE TO FIND THINGS", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const resources = [
      { label: "Task backlog", file: "docs/TASKS.md" },
      { label: "How to contribute", file: "docs/CONTRIBUTING.md" },
      { label: "Dev environment setup", file: "docs/DEV-ENVIRONMENT-SETUP.md" },
      { label: "GitHub process", file: "docs/GITHUB-PROCESS.md" },
      { label: "Test plan", file: "docs/TESTING.md" },
      { label: "Security model", file: "docs/SECURITY.md" },
      { label: "POS integrations", file: "docs/POS-COMPATIBILITY.md" },
      { label: "Live server", file: "https://web-production-9f35d.up.railway.app" },
    ];
    resources.forEach((r, i) => {
      const y = 1.3 + i * 0.48;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.4, fill: { color: i % 2 === 0 ? OFF_WHITE : WHITE } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.4, fill: { color: GOLD } });
      s.addText(r.label, { x: 0.9, y, w: 3, h: 0.4, fontSize: 12, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0 });
      s.addText(r.file, { x: 3.9, y, w: 5.3, h: 0.4, fontSize: 11, fontFace: "monospace", color: "555555", valign: "middle", margin: 0 });
    });
  }

  // Slide 7: First Week Goals
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addText("FIRST WEEK GOALS", { x: 0.8, y: 0.35, w: 9, h: 0.5, fontSize: 24, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const goals = [
      { day: "Day 1 AM", goal: "Read this deck + Dev Environment Setup deck. Install everything." },
      { day: "Day 1 PM", goal: "Read GitHub Process deck. Make a small PR (typo fix). Get it merged." },
      { day: "Day 2-3", goal: "Read the code. Understand how pass generation works." },
      { day: "Day 3-4", goal: "Pick a Priority 1 task from docs/TASKS.md" },
      { day: "Day 4-5", goal: "Open a draft PR, get feedback, iterate, merge" },
      { day: "Week retro", goal: "What you learned, what was confusing, what's next" },
    ];
    goals.forEach((g, i) => {
      const y = 1.1 + i * 0.65;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.55, fill: { color: "0A1A35" } });
      s.addShape(pres.shapes.OVAL, { x: 0.75, y: y + 0.05, w: 0.45, h: 0.45, fill: { color: GOLD } });
      s.addText(String(i + 1), { x: 0.75, y: y + 0.05, w: 0.45, h: 0.45, fontSize: 16, fontFace: "Arial Black", bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
      s.addText(g.day, { x: 1.4, y, w: 2.2, h: 0.55, fontSize: 12, fontFace: "Arial", bold: true, color: GOLD, valign: "middle", margin: 0 });
      s.addText(g.goal, { x: 3.6, y, w: 5.7, h: 0.55, fontSize: 11, fontFace: "Arial", color: WHITE, valign: "middle", margin: 0 });
    });
  }

  // Slide 8: Tips for Success
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: NAVY } });
    s.addText("TIPS FOR SUCCESS", { x: 0.8, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", bold: true, color: GOLD, margin: 0 });

    const tips = [
      { tip: "Ask questions early", desc: "Don't get stuck for hours. Ping your manager or open a draft PR with questions." },
      { tip: "Read existing code first", desc: "Patterns matter. Look at similar features before writing new ones." },
      { tip: "Keep PRs small", desc: "1 task = 1 PR. Easier to review, faster to merge." },
      { tip: "Use Claude Code", desc: "AI pair programming speeds up boilerplate and explains unfamiliar code." },
      { tip: "Test before you push", desc: "Run npm start. Click around. Make sure it works." },
      { tip: "Ship it", desc: "Done and reviewable beats perfect and private." },
    ];
    tips.forEach((t, i) => {
      const y = 1.3 + i * 0.68;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.58, fill: { color: OFF_WHITE }, shadow: makeShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.58, fill: { color: GOLD } });
      s.addText(t.tip, { x: 0.9, y, w: 2.5, h: 0.58, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, valign: "middle", margin: 0 });
      s.addText(t.desc, { x: 3.4, y, w: 5.8, h: 0.58, fontSize: 11, fontFace: "Arial", color: "555555", valign: "middle", margin: 0 });
    });
  }

  // Slide 9: Closing
  {
    const s = pres.addSlide();
    s.background = { color: DARK_NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
    s.addImage({ data: icons.football, x: 4.4, y: 1.0, w: 1.2, h: 1.2 });
    s.addText("LET'S BUILD SOMETHING", { x: 0.8, y: 2.4, w: 8.4, h: 0.6, fontSize: 32, fontFace: "Arial Black", bold: true, color: GOLD, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.2, w: 3.0, h: 0.04, fill: { color: GOLD } });
    s.addText("Real users. Real businesses. Real impact for the football program.\nYour code will be in hundreds of people's phones.", { x: 0.8, y: 3.5, w: 8.4, h: 0.8, fontSize: 16, fontFace: "Arial", italic: true, color: WHITE, align: "center", margin: 0 });
    s.addText("Next steps: Dev Environment Setup → GitHub Process → pick a task", { x: 0.8, y: 4.8, w: 8.4, h: 0.3, fontSize: 11, fontFace: "Arial", color: LIGHT_GOLD, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });
  }

  await pres.writeFile({ fileName: path.resolve(__dirname, "Del-Norte-Engineer-Onboarding.pptx") });
  console.log("  Engineer Onboarding deck saved (9 slides)");
}

async function main() {
  console.log("Generating decks...\n");
  await buildEnvDeck();
  await buildOnboardingDeck();
  console.log("\nDone");
}

main().catch(console.error);
