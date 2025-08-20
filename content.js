// Content script for eszett_replacer
// Replaces ß with ss (and ẞ with SS) in text nodes, skipping editable fields and code/script/style.
(function() {
  let enabledForSite = true; // default; will be updated from storage

  const IGNORED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"]);
  function isEditable(node) {
    if (!node) return false;
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const el = /** @type {HTMLElement} */ (node);
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return true;
    return false;
  }

  function shouldSkip(node) {
    // Skip inside ignored tags or if any ancestor is contentEditable
    let current = node.parentNode;
    while (current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const el = /** @type {HTMLElement} */ (current);
        if (IGNORED_TAGS.has(el.tagName)) return true;
        if (el.isContentEditable) return true;
      }
      current = current.parentNode;
    }
    return false;
  }

  function replaceTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const val = node.nodeValue;
    if (!val) return;
    if (!val.includes("ß") && !val.includes("ẞ")) return;
    node.nodeValue = val.replace(/ß/g, "ss").replace(/ẞ/g, "SS");
  }

  function walkAndReplace(root) {
    // Use TreeWalker for efficiency
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        if (!node.parentNode) return NodeFilter.FILTER_REJECT;
        if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const toProcess = [];
    let n;
    while ((n = walker.nextNode())) {
      toProcess.push(n);
    }
    for (const textNode of toProcess) {
      replaceTextNode(textNode);
    }
  }

  function runOnce() {
    if (!enabledForSite) return;
    if (document.body) {
      walkAndReplace(document.body);
    }
  }

  // Observe mutations to handle dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    if (!enabledForSite) return;
    for (const m of mutations) {
      for (const added of m.addedNodes) {
        if (added.nodeType === Node.TEXT_NODE) {
          if (!shouldSkip(added)) replaceTextNode(added);
        } else if (added.nodeType === Node.ELEMENT_NODE) {
          const el = /** @type {HTMLElement} */ (added);
          if (!IGNORED_TAGS.has(el.tagName) && !el.isContentEditable) {
            walkAndReplace(el);
          }
        }
      }
      if (m.type === "characterData" && m.target && m.target.nodeType === Node.TEXT_NODE) {
        replaceTextNode(m.target);
      }
    }
  });

  function startObserver() {
    if (!document.body) return;
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function stopObserver() {
    observer.disconnect();
  }

  // Sync enabled state from storage (per hostname)
  function refreshEnabledFromStorage() {
    const host = location.hostname;
    chrome.storage.sync.get({ siteSettings: {} }, (data) => {
      const siteSettings = data.siteSettings || {};
      enabledForSite = siteSettings[host] !== false; // default true
      if (enabledForSite) {
        runOnce();
        startObserver();
      } else {
        stopObserver();
      }
    });
  }

  // Listen for changes from popup/background
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.siteSettings) {
      refreshEnabledFromStorage();
    }
  });

  // Initial
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      refreshEnabledFromStorage();
    });
  } else {
    refreshEnabledFromStorage();
  }
})();
