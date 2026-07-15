const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function serializeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function safeHref(value) {
  const href = value.trim();
  if (!href || /[\u0000-\u001f\u007f\\]/.test(href) || href.startsWith("//")) return null;
  if (href.startsWith("#") || href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) {
    return href;
  }
  try {
    const url = new URL(href);
    return SAFE_SCHEMES.has(url.protocol) ? href : null;
  } catch {
    return null;
  }
}

export function renderInlineMarkdown(value) {
  const placeholders = [];
  const reserve = (html) => {
    const marker = `\u0000ASTRO_INTL_${placeholders.length}\u0000`;
    placeholders.push(html);
    return marker;
  };

  let text = String(value);
  text = text.replace(/`([^`]+)`/g, (_match, code) => reserve(`<code>${escapeHtml(code)}</code>`));
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, rawHref) => {
    const href = safeHref(rawHref);
    if (!href) return `${label} (${rawHref})`;
    return reserve(`<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`);
  });

  text = escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return text.replace(/\u0000ASTRO_INTL_(\d+)\u0000/g, (_match, index) => placeholders[Number(index)]);
}
