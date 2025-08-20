// Popup script to toggle per-site enable/disable
function getHostFromUrl(url) {
  try { return new URL(url).hostname; } catch { return ""; }
}

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const host = getHostFromUrl(tab?.url || "");

  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');

  chrome.storage.sync.get({ siteSettings: {} }, (data) => {
    const siteSettings = data.siteSettings || {};
    const enabled = siteSettings[host] !== false; // default true
    toggle.checked = enabled;
    status.textContent = enabled ? "Enabled for this site" : "Disabled for this site";
  });

  toggle.addEventListener('change', () => {
    chrome.storage.sync.get({ siteSettings: {} }, (data) => {
      const siteSettings = data.siteSettings || {};
      siteSettings[host] = toggle.checked; // true means enabled
      chrome.storage.sync.set({ siteSettings }, () => {
        status.textContent = toggle.checked ? "Enabled for this site" : "Disabled for this site";
      });
    });
  });

  document.getElementById('policy').addEventListener('click', (e) => {
    // Placeholder; will be replaced by actual policy link in README/Store.
  });
});
