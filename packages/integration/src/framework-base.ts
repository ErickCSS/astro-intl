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

  const tagSet = new Set(tagNames);
  const escapedTags = [...tagSet].map(escapeRegExp);

  const result: RichSegment[] = [];
  let lastIndex = 0;
  const stack: Array<{ tag: string; openStart: number; contentStart: number }> = [];
  const tokenRegex = new RegExp(`<(/?)(${escapedTags.join("|")})>`, "g");
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(str)) !== null) {
    const isClosing = Boolean(match[1]);
    const tag = match[2];
    if (!tagSet.has(tag)) continue;

    if (!isClosing) {
      stack.push({ tag, openStart: match.index, contentStart: tokenRegex.lastIndex });
      continue;
    }

    const open = stack.at(-1);
    if (!open || open.tag !== tag) continue;

    stack.pop();
    if (stack.length === 0) {
      if (open.openStart > lastIndex) {
        result.push({ type: "text", value: str.slice(lastIndex, open.openStart) });
      }
      result.push({ type: "tag", tag, chunks: str.slice(open.contentStart, match.index) });
      lastIndex = tokenRegex.lastIndex;
    }
  }

  if (lastIndex < str.length) {
    result.push({ type: "text", value: str.slice(lastIndex) });
  }

  return result;
}
