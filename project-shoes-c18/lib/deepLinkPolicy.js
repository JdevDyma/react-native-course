export function createDeepLinkPolicy(prefixes, shoeIds) {
  const allowedPrefixes = [...new Set(prefixes)].sort((a, b) => b.length - a.length);
  const knownShoes = new Set(shoeIds);

  return function readNavigationURL(value) {
    if (typeof value !== "string" || value.length > 4096 ||
        /[\s\u0000-\u001f\u007f]/.test(value)) return null;
    const prefix = allowedPrefixes.find((entry) => value.startsWith(entry));
    if (!prefix) return null;
    const path = value.slice(prefix.length);
    // Ces destinations n'acceptent ni query string ni fragment.
    if (path === "" || path === "cart" || path === "notifications") {
      return { url: value, path };
    }
    const match = /^details\/([a-zA-Z0-9_-]+)$/.exec(path);
    if (!match || !knownShoes.has(match[1])) return null;
    return { url: value, path, shoeId: match[1] };
  };
}

export function isStripeReturnURL(value, returnURL) {
  if (typeof value !== "string" || typeof returnURL !== "string" ||
      !returnURL || value.length > 16384 || /[\u0000-\u0020\u007f]/.test(value)) return false;
  return value === returnURL || value.startsWith(`${returnURL}?`) ||
    value.startsWith(`${returnURL}#`);
}
