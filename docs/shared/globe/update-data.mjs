// Regenerate the two local data files after updating CLDR or world-atlas.
import { writeFileSync } from "node:fs";
import territories from "cldr-core/supplemental/territoryInfo.json" with { type: "json" };
import codes from "cldr-core/supplemental/codeMappings.json" with { type: "json" };
import coarse from "world-atlas/countries-110m.json" with { type: "json" };
import detailed from "world-atlas/countries-50m.json" with { type: "json" };
import { feature } from "topojson-client";

const languages = {};
for (const lang of ["es", "en", "pt", "fr", "ja"]) {
  const countries = [];
  for (const [region, territory] of Object.entries(
    territories.supplemental.territoryInfo,
  )) {
    const usage = territory.languagePopulation?.[lang];
    const numeric = codes.supplemental.codeMappings[region]?._numeric;
    if (!usage || !numeric) continue;
    if (
      ["official", "de_facto_official"].includes(usage._officialStatus) ||
      Number(usage._populationPercent) > 50
    ) {
      countries.push(numeric);
    }
  }
  languages[lang] = countries.sort();
}
const table = {
  cldr: territories.supplemental.version._cldrVersion,
  languages,
};
writeFileSync(
  new URL("./languages.json", import.meta.url),
  JSON.stringify(table, null, 2) + "\n",
);

// Keep the light world outline and add small countries absent at that scale.
const represented = new Set(
  coarse.objects.countries.geometries.map((country) => country.id),
);
const smallCountries = feature(
  detailed,
  detailed.objects.countries,
).features.filter((country) => country.id && !represented.has(country.id));
const compact = JSON.stringify(smallCountries, (_, value) =>
  typeof value === "number" ? Number(value.toFixed(3)) : value,
);
writeFileSync(
  new URL("./small-countries.json", import.meta.url),
  compact + "\n",
);
