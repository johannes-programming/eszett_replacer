# eszett_replacer

A minimal Chrome extension that replaces **ß**→**ss** (and **ẞ**→**SS**) on webpages. Includes a per‑site toggle from the toolbar.

## Features
- Safe text-node replacement using a TreeWalker (skips inputs, textareas, contenteditable, script/style/code/pre).
- Handles dynamic content with MutationObserver.
- Per-site enable/disable via popup.

## Install (Unpacked)
1. Open `chrome://extensions/` and enable **Developer mode**.
2. Click **Load unpacked** and select this folder.

## Publish (Chrome Web Store)
1. Create a developer account at the Chrome Web Store Developer Dashboard.
2. Prepare listing:
   - **Icon**: 128×128 PNG (provided).
   - **Screenshots**: at least one, e.g., 1280×800.
   - **Short description** (max ~132 chars) and **long description**.
   - **Privacy policy**: if no data is collected, state that clearly.
3. Upload the ZIP from releases and submit.

## Permissions
- `storage`: saves per-site toggle (no personal data).  
- `scripting`/`activeTab`: standard MV3 boilerplate.  
- `<all_urls>` host permission: needed to run on pages.

## Data Safety
This extension does **not** collect or transmit any user data.

## License
MIT
