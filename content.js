function replaceEszett(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.nodeValue.includes("ß")) {
      node.nodeValue = node.nodeValue.replace(/ß/g, "ss");
    }
  } else {
    node.childNodes.forEach(replaceEszett);
  }
}

// Initial replacement on page load
replaceEszett(document.body);

// Handle dynamically loaded content
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach(replaceEszett);
  }
});
observer.observe(document.body, { childList: true, subtree: true });
