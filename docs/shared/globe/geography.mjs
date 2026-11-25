import { geoGraticule, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json" with { type: "json" };
import coverage from "./languages.json" with { type: "json" };
import smallCountries from "./small-countries.json" with { type: "json" };

export const stops = [
  {
    code: "es-DO",
    id: "214",
    city: ["Santo Domingo", "Santo Domingo"],
    point: [-69.93, 18.48],
    name: ["Español dominicano", "Dominican Spanish"],
    greeting: "¡Qué lo que!",
  },
  {
    code: "en-US",
    id: "840",
    city: ["Washington D. C.", "Washington, DC"],
    point: [-77.04, 38.91],
    name: ["Inglés estadounidense", "American English"],
    greeting: "Hello there!",
  },
  {
    code: "pt-BR",
    id: "076",
    city: ["Brasília", "Brasília"],
    point: [-47.88, -15.79],
    name: ["Portugués brasileño", "Brazilian Portuguese"],
    greeting: "Olá, tudo bem?",
  },
  {
    code: "fr-FR",
    id: "250",
    city: ["París", "Paris"],
    point: [2.35, 48.86],
    name: ["Francés de Francia", "French (France)"],
    greeting: "Salut !",
  },
  {
    code: "ja-JP",
    id: "392",
    city: ["Tokio", "Tokyo"],
    point: [139.69, 35.68],
    name: ["Japonés", "Japanese"],
    greeting: "こんにちは！",
  },
];

export const countries = [
  ...feature(world, world.objects.countries).features,
  ...smallCountries,
];
export const grid = geoGraticule().step([20, 20])();
export function globeProjection(point) {
  return geoOrthographic()
    .translate([230, 174])
    .scale(158)
    .precision(0.5)
    .rotate([-point[0], -point[1]]);
}
export function pathGenerator(projection) {
  return geoPath(projection).digits(1);
}
export function countryClass(country, stop) {
  if (country.id === stop.id) return "selected";
  return coverage.languages[stop.code.slice(0, 2)].includes(country.id)
    ? "spoken"
    : "land";
}
