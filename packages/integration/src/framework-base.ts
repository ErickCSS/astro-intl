import { escapeRegExp } from "./sanitize.js";

// ─── Rich text segment types ────────────────────────────────────────

export type RichSegmentText = { type: "text"; value: string };
export type RichSegmentTag = { type: "tag"; tag: string; chunks: string };
export type RichSegment = RichSegmentText | RichSegmentTag;

// ─── Parse rich text into framework-agnostic segments ───────────────

export function parseRichSegments(str: string, tagNames: string[]): RichSegment[] {
  if (tagNames.length === 0) {
    return str.length > 0 ? [{ type: "text", value: str }] : [];
  }

  const escaped = tagNames.map(escapeRegExp);
  const regex = new RegExp(`<(${escaped.join("|")})>(.*?)<\\/(\\1)>`, "g");

  const result: RichSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: "text", value: str.slice(lastIndex, match.index) });
    }

    const [, tag, chunks] = match;
    result.push({ type: "tag", tag, chunks });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < str.length) {
    result.push({ type: "text", value: str.slice(lastIndex) });
  }

  return result;
}
