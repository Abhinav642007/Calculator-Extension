# Retro Vintage Calculator — Browser Extension (Manifest V3)

A retro-style browser calculator extension inspired by vintage 1980s desktop electronic calculators. Features an authentic aged ivory molded chassis, recessed dark emerald LCD display with glowing mint-green digits, tactile physical keycaps with 3D drop depth, and a robust math evaluation engine.

---

## Features

- **Accurate Mathematical Operations**: Addition (`+`), subtraction (`−`), multiplication (`×`), division (`÷`), percentage (`%`), decimal (`.`), and sign toggle (`±`).
- **Standard Operator Precedence**: Safely evaluates expressions respecting precedence (`×` and `÷` computed before `+` and `−`), e.g. `2 + 3 × 4 = 14`.
- **Safe Evaluation (Zero `eval`)**: Custom tokenizer and Shunting-Yard parser + Reverse Polish Notation (RPN) stack evaluator with zero unrestricted `eval()`.
- **Edge-Case Resilience**: Cleanly catches division by zero, invalid expressions, and floating-point precision artifacts without displaying `NaN` or `Infinity`.
- **Dual Calculation Display**:
  - **Upper line**: Live expression history showing the ongoing formula and operations.
  - **Main display**: Large digital LCD digits with glowing mint-green phosphor styling and faint unlit 7-segment ghost segments.
- **Tactile Visual Feedback**: Buttons visibly depress when clicked or triggered via keyboard shortcuts.
- **Full Keyboard Support**: Fast, intuitive numeric and operational keybindings.
- **Completely Local & Offline**: Self-contained extension with local fonts and icons. No remote network calls, tracking, or external dependencies.

---

## Keyboard Shortcuts

| Key | Calculator Action |
|:---|:---|
| `0` – `9` | Enter numbers |
| `.` | Decimal point |
| `+` | Addition |
| `-` | Subtraction (`−`) |
| `*` or `x` / `X` | Multiplication (`×`) |
| `/` | Division (`÷`) |
| `%` | Percentage |
| `Enter` or `=` | Calculate equals |
| `Escape` or `c` / `C` | All Clear (`AC`) |
| `Backspace` or `Delete` | Delete last entry (`DEL`) |
| `_`, `#`, or `F9` | Sign toggle (`±`) |

---

## How to Install and Test in Google Chrome

Follow these simple steps to load the extension into Google Chrome:

1. **Open the Extensions Page**:
   - In Google Chrome, navigate to `chrome://extensions` in the address bar.
   - Alternatively, click the Chrome menu (three vertical dots) → **Extensions** → **Manage Extensions**.

2. **Enable Developer Mode**:
   - In the top-right corner of the Extensions page, toggle the **Developer mode** switch to **ON**.

3. **Load the Unpacked Extension**:
   - Click the **"Load unpacked"** button in the top-left toolbar.
   - In the file selection dialog, choose this folder:
     ```
     /Users/apple/Documents/Minor-Extension/Calculator
     ```
   - Click **Select** or **Open**.

4. **Pin and Open**:
   - Click the puzzle icon (Extensions) in Chrome's top toolbar.
   - Click the pin icon next to **"Retro Vintage Calculator"**.
   - Click the calculator icon to open the popup and enjoy!

---

## File Structure

```
Calculator/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── popup.html                 # Calculator layout, LCD bezel, and keypad
├── popup.css                  # Retro vintage styling, 3D tactile buttons, LCD effects
├── popup.js                   # Shunting-Yard evaluator, precision handling, keyboard listener
├── fonts/
│   ├── ShareTechMono.woff2    # Offline retro digital typeface
│   └── VT323.woff2            # Offline vintage 7-segment LCD typeface
├── icons/
│   ├── icon16.png             # 16x16 extension toolbar icon
│   ├── icon48.png             # 48x48 extension management icon
│   └── icon128.png            # 128x128 store & installation banner icon
└── README.md                  # Documentation and testing guide
```
