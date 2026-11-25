import markdown from "../../CHANGELOG.md?raw";
import spanish from "./changelog.es.json";
import { renderInlineMarkdown } from "./security.mjs";

const categories = {
  Added: "added",
  Changed: "changed",
  Fixed: "fixed",
  Security: "security",
  "Breaking Changes": "breaking",
} as const;
type Category = (typeof categories)[keyof typeof categories];
interface Entry {
  title: string;
  date?: string;
  badge: "next" | "latest" | "previous";
  items: { type: Category; text: string }[];
}
const translations: Record<string, string> = spanish;

export function parseChangelog(locale: string): Entry[] {
  const entries: Entry[] = [];
  let entry: Entry | undefined;
  let type: Category | undefined;
  let foundRelease = false;

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^## \[([^\]]+)\](?: - (\d{4}(?:-\d{2}-\d{2})?))?/);
    if (heading) {
      const [, version, date] = heading;
      const pending = version === "Unreleased";
      entry = {
        title: pending && locale === "es" ? "Sin publicar" : version,
        date,
        badge: pending ? "next" : foundRelease ? "previous" : "latest",
        items: [],
      };
      if (!pending) foundRelease = true;
      entries.push(entry);
      type = undefined;
    } else if (line.startsWith("### ")) {
      const heading = line.slice(4);
      type = Object.hasOwn(categories, heading) ? categories[heading as keyof typeof categories] : undefined;
    } else if (entry && type && line.startsWith("- ")) {
      const source = line.slice(2);
      const text = locale === "es" ? translations[source] ?? source : source;
      entry.items.push({ type, text: renderInlineMarkdown(text) });
    }
  }
  return entries.filter(entry => entry.badge !== "next" || entry.items.length > 0);
}
