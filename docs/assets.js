/* Export helpers also used by the dependency-free regression tests. */
window.IconAssets = (() => {
  function cleanSVG(text) {
    // Development servers can inject JavaScript containing unescaped XML
    // characters. Remove it before XML parsing, copying, or downloading.
    // This is compatibility cleanup for repository assets, not a sanitizer
    // for arbitrary untrusted uploads.
    return text.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
      .replace(/<!--\s*Code injected by live-server\s*-->/gi, '').trim();
  }
  async function copyText(text, clipboard, legacyCopy) {
    if (clipboard?.writeText) {
      try { await clipboard.writeText(text); return true; } catch { /* Try legacy copy. */ }
    }
    try { return Boolean(legacyCopy(text)); } catch { return false; }
  }
  return { cleanSVG, copyText };
})();
