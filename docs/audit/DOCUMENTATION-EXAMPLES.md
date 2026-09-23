# Documentation example findings

The new first-translation guide is verified against the installed official-site
dependency (2.2.2) and the local integration, in Astro 7 development and static
production builds. This work does not change library APIs or dependencies.

## JSON loading from astro.config.mjs

The old `messages: { en: () => import("./src/i18n/messages/en.json") }` example
failed during prerendering with `ERR_IMPORT_ATTRIBUTE_MISSING` on Node 24.8.0
and Astro 7.1.4. The tutorial now uses explicit JSON imports with
`with { type: "json" }`, then `messages: { en, es }`. This is a documentation
correction, not a runtime fix. The tutorial states its Astro 7 / Node 22.12+
baseline; it does not claim to verify all supported older Astro/Node pairs.

## Separate follow-up: messagesDir resolution

The integration constructs imports from the supplied directory string inside
the package module, with Vite processing disabled. The prior relative-directory
example therefore needs independent verification for development, prerendering
and deployed SSR before being recommended. This is a source-inspection finding,
not a reproduced defect in this change. Keep it out of the beginner path; a
future library task should reproduce and define its path and packaging behavior.

## Documentation maintenance

- `docs/shared/quick-start.mjs` is the source of the exact runnable tutorial files.
- `docs/shared/doc-guides.mjs` holds the bilingual learning sequence shared by
  the official site and playground.
- Both README tutorials must contain the same source snippets; `docs:check`
  checks that they have not drifted.
- `pnpm docs:tutorial:check` builds and serves those files against both package
  versions in ignored cache directories.
- After `pnpm consumers:check`, run `pnpm docs:links:check` to validate generated
  documentation links, section anchors and legacy entry links.
- Publication and deployment are separate from these local checks.
