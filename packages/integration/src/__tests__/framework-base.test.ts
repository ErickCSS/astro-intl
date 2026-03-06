import { describe, it, expect } from "vitest";
import { parseRichSegments } from "../framework-base.js";

describe("framework-base.ts", () => {
  describe("parseRichSegments", () => {
    it("should return single text segment for plain text", () => {
      const result = parseRichSegments("Hello world", []);
      expect(result).toEqual([{ type: "text", value: "Hello world" }]);
    });

    it("should return empty array for empty string", () => {
      const result = parseRichSegments("", []);
      expect(result).toEqual([]);
    });

    it("should parse a single tag", () => {
      const result = parseRichSegments("Click <link>here</link> to continue", ["link"]);
      expect(result).toEqual([
        { type: "text", value: "Click " },
        { type: "tag", tag: "link", chunks: "here" },
        { type: "text", value: " to continue" },
      ]);
    });

    it("should parse multiple tags", () => {
      const result = parseRichSegments("Text with <bold>bold</bold> and <italic>italic</italic>", [
        "bold",
        "italic",
      ]);
      expect(result).toEqual([
        { type: "text", value: "Text with " },
        { type: "tag", tag: "bold", chunks: "bold" },
        { type: "text", value: " and " },
        { type: "tag", tag: "italic", chunks: "italic" },
      ]);
    });

    it("should handle adjacent tags", () => {
      const result = parseRichSegments("<tag1>First</tag1><tag2>Second</tag2>", ["tag1", "tag2"]);
      expect(result).toEqual([
        { type: "tag", tag: "tag1", chunks: "First" },
        { type: "tag", tag: "tag2", chunks: "Second" },
      ]);
    });

    it("should handle empty chunks", () => {
      const result = parseRichSegments("Text <tag></tag> more text", ["tag"]);
      expect(result).toEqual([
        { type: "text", value: "Text " },
        { type: "tag", tag: "tag", chunks: "" },
        { type: "text", value: " more text" },
      ]);
    });

    it("should return text segment when no matching tags found", () => {
      const result = parseRichSegments("Hello <unknown>world</unknown>", ["link"]);
      expect(result).toEqual([{ type: "text", value: "Hello <unknown>world</unknown>" }]);
    });

    it("should handle tag names with special regex characters", () => {
      const result = parseRichSegments("Click <link.ext>here</link.ext> now", ["link.ext"]);
      expect(result).toEqual([
        { type: "text", value: "Click " },
        { type: "tag", tag: "link.ext", chunks: "here" },
        { type: "text", value: " now" },
      ]);
    });

    it("should treat text as plain when tagNames is empty", () => {
      const result = parseRichSegments("Click <link>here</link>", []);
      expect(result).toEqual([{ type: "text", value: "Click <link>here</link>" }]);
    });
  });
});
