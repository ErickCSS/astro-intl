import fs from "node:fs";
import path from "node:path";

export interface ChangelogItem {
  type: "added" | "changed" | "fixed" | "security";
  text: string;
}

export interface ChangelogVersion {
  id: string;
  title: string;
  badge: string;
  items: ChangelogItem[];
}

const TYPE_MAP: Record<string, ChangelogItem["type"]> = {
  added: "added",
  changed: "changed",
  fixed: "fixed",
  security: "security",
};

const BADGE_MAP: Record<string, string> = {
  unreleased: "next",
};

function slugify(version: string): string {
  return version.toLowerCase().replace(/[[\]]/g, "").replace(/\s.*/, "").replace(/\./g, "");
}

function inlineMarkdownToHtml(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

export function parseChangelog(): ChangelogVersion[] {
  // Astro cwd is the docs project root (docs/astro-intl-i18n/).
  // CHANGELOG.md lives at the monorepo root, two levels up.
  const mdPath = path.resolve(process.cwd(), "../../CHANGELOG.md");
  const raw = fs.readFileSync(mdPath, "utf-8");

  const versions: ChangelogVersion[] = [];
  let current: ChangelogVersion | null = null;
  let currentType: ChangelogItem["type"] = "added";

  for (const line of raw.split("\n")) {
    const versionMatch = line.match(/^## \[(.+?)\]/);
    if (versionMatch) {
      if (current) versions.push(current);
      const title = versionMatch[1];
      const id = slugify(title);
      const badge = BADGE_MAP[id] ?? (versions.length === 0 ? "next" : "latest");
      current = { id, title, badge, items: [] };
      continue;
    }

    const sectionMatch = line.match(/^### (\w+)/);
    if (sectionMatch) {
      const key = sectionMatch[1].toLowerCase();
      if (key in TYPE_MAP) {
        currentType = TYPE_MAP[key];
      }
      continue;
    }

    const itemMatch = line.match(/^- (.+)/);
    if (itemMatch && current) {
      current.items.push({
        type: currentType,
        text: inlineMarkdownToHtml(itemMatch[1]),
      });
    }
  }

  if (current) versions.push(current);

  // Assign badges: first = next (unreleased), last released = latest, rest = initial
  if (versions.length > 1) {
    let foundLatest = false;
    for (let i = 0; i < versions.length; i++) {
      if (versions[i].id === "unreleased") {
        versions[i].badge = "next";
      } else if (!foundLatest) {
        versions[i].badge = "latest";
        foundLatest = true;
      } else {
        versions[i].badge = "initial";
      }
    }
  }

  return versions;
}
