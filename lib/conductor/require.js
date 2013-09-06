export var requiredUrls = [];
export var requiredCSSUrls = [];

export function requireURL(url) {
  requiredUrls.push(url);
}

export function requireCSS(url) {
  requiredCSSUrls.push(url);
}
