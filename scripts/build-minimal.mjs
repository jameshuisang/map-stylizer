import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";

const root = new URL("../src/templates/minimal/", import.meta.url);
const palette = JSON.parse(await readFile(new URL("palette.json", root), "utf8"));
const c = palette.colors;
const write = (name, data) => writeFile(new URL(name, root), JSON.stringify(data, null, 2) + "\n");
for (const [role, value] of Object.entries(c)) {
  if (!/^#[\da-f]{6}$/i.test(value)) throw new Error(`Invalid color for ${role}`);
}

// Mappedin Studio's indoor theme contract, independently populated from our palette.
const indoor = {
  name: "Minimal", showEntrances: true,
  wallHeights: { interior: 0.7, exterior: 0.9 },
  roomHeight: 0.08,
  roomHeights: { standard: 0.08, hallway: 0.08, connection: 0.08, bathroom: 0.08, inaccessible: 0.08 },
  objectHeight: 0.35, roomHeightsLinked: true,
  opacity: Object.fromEntries(["standard", "inaccessible", "bathroom", "hallway", "connection", "interiorWall", "exteriorWall", "desk", "doors"].map(key => [key, 100])),
  colors: {
    accent: { primary: c.accent, secondary: c.textSecondary, neutral: c.border, neutral2: c.building, success: c.success, error: c.error },
    background: { primary: c.surface, secondary: c.surfaceMuted, tertiary: c.hover, inverted: c.text },
    text: { primary: c.text, secondary: c.textSecondary, tertiary: c.textSecondary, quaternary: c.textSecondary, highlight: c.accent, placeholder: c.textSecondary, inverted: c.surface, error: c.error, link: c.accent },
    map: {
      labels: Object.fromEntries(["default", "connection", "washroom", "parking", "point", "door"].flatMap(role => [[role, role === "default" ? c.text : c.textSecondary], [role + "Outline", c.surface]])),
      markers: { icon: c.surface, background: c.surface, default: c.textSecondary, parachute: c.accent, highlight: c.accent, departure: c.accent, destination: c.accent, youAreHere: c.accent },
      geometry: { wallTops: c.wallTop, departure: c.accent, highlight: c.selected, hover: c.hover },
      path: c.accent, background: c.canvas
    },
    rooms: { standard: c.room, inaccessible: c.inaccessible, bathroom: c.bathroom, hallway: c.hallway, connection: c.connection, desk: c.object, wall: c.wall, interiorWall: c.wall, exteriorWall: c.wall, doors: c.wall }
  }
};

const ramp = (...stops) => ["interpolate", ["linear"], ["zoom"], ...stops];
const fill = (id, sourceLayer, color, extra = {}) => ({ id, type: "fill", source: "osm", "source-layer": sourceLayer, paint: { "fill-color": color }, ...extra });
const line = (id, sourceLayer, color, width, extra = {}) => ({ id, type: "line", source: "osm", "source-layer": sourceLayer, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": color, "line-width": width }, ...extra });
const name = ["coalesce", ["get", "name:en"], ["get", "name:latin"], ["get", "name"]];
const label = (id, sourceLayer, size, extra = {}) => ({ id, type: "symbol", source: "osm", "source-layer": sourceLayer, layout: { "text-field": name, "text-font": ["montserrat-light"], "text-size": size, "text-padding": 5, "text-max-width": 9, "text-letter-spacing": 0.015 }, paint: { "text-color": c.textSecondary, "text-halo-color": c.surface, "text-halo-width": 1.5 }, ...extra });
const roadClass = classes => ["in", ["get", "class"], ["literal", classes]];
const major = roadClass(["motorway", "trunk", "primary"]);
const minor = roadClass(["secondary", "tertiary", "minor"]);
const service = roadClass(["service", "track", "path"]);
const outdoor = {
  version: 8, name: "Minimal",
  metadata: { "map-stylizer:template": "minimal", "map-stylizer:version": 1, "map-stylizer:provider": "mappedin" },
  glyphs: "https://tile-server.mappedin.com/fonts/{fontstack}/{range}.pbf",
  sources: { osm: { type: "vector", url: "https://tile-server.mappedin.com/data/osm.json", attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' } },
  layers: [
    { id: "background", type: "background", paint: { "background-color": c.canvas } },
    fill("landuse", "landuse", c.land),
    fill("park", "landuse", c.park, { filter: roadClass(["park", "cemetery", "recreation_ground"]) }),
    fill("natural", "landcover", c.park, { filter: roadClass(["wood", "grass", "public_park"]) }),
    fill("water", "water", c.water),
    line("waterway", "waterway", c.water, ramp(10, 0.7, 16, 3), { minzoom: 8 }),
    line("boundary", "boundary", c.buildingOutline, 0.6, { maxzoom: 13, paint: { "line-color": c.buildingOutline, "line-width": 0.6, "line-dasharray": [3, 3], "line-opacity": 0.7 } }),
    fill("building", "building", c.building, { minzoom: 14, paint: { "fill-color": c.building, "fill-outline-color": c.buildingOutline, "fill-opacity": ramp(14, 0, 15, 1) } }),
    line("service-casing", "transportation", c.roadCasing, ramp(14, 0.5, 18, 5), { minzoom: 15, filter: service }),
    line("minor-casing", "transportation", c.roadCasing, ramp(11, 0.5, 15, 4, 18, 14), { minzoom: 11, filter: minor }),
    line("major-casing", "transportation", c.roadCasing, ramp(6, 0.5, 12, 3, 16, 10, 18, 22), { minzoom: 6, filter: major }),
    line("service", "transportation", c.road, ramp(14, 0.3, 18, 3.5), { minzoom: 15, filter: service }),
    line("minor", "transportation", c.road, ramp(11, 0.3, 15, 2.8, 18, 12), { minzoom: 11, filter: minor }),
    line("major", "transportation", c.highway, ramp(6, 0.3, 12, 1.8, 16, 8, 18, 20), { minzoom: 6, filter: major }),
    line("railway", "transportation", c.rail, ramp(12, 0.5, 18, 2), { minzoom: 13, filter: roadClass(["rail"]), paint: { "line-color": c.rail, "line-width": ramp(12, 0.5, 18, 2), "line-dasharray": [2, 2] } }),
    label("street-label", "transportation_name", ramp(13, 11, 18, 13), { minzoom: 14, layout: { "text-field": name, "text-font": ["montserrat-light"], "text-size": ramp(13, 11, 18, 13), "symbol-placement": "line", "symbol-spacing": 350, "text-padding": 6 } }),
    label("water-label", "water_name", 12, { minzoom: 9, paint: { "text-color": c.waterLabel, "text-halo-color": c.water, "text-halo-width": 1 } }),
    label("place-label", "place", ramp(5, 12, 12, 15), { minzoom: 5, filter: roadClass(["city", "town", "village", "suburb", "neighbourhood"]) }),
    label("country-label", "place", ramp(1, 12, 5, 16), { maxzoom: 7, filter: roadClass(["country", "state"]) })
  ]
};
// Same visual rules, public assets for editing outside the authenticated SDK.
const preview = structuredClone(outdoor);
preview.name = "Minimal · public preview";
preview.metadata["map-stylizer:provider"] = "openfreemap";
preview.sources.osm.url = "https://tiles.openfreemap.org/planet";
preview.sources.osm.attribution = '<a href="https://openfreemap.org/">OpenFreeMap</a> © <a href="https://openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
preview.glyphs = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
preview.center = [-79.3832, 43.6532];
preview.zoom = 13;
for (const layer of preview.layers) if (layer.type === "symbol") layer.layout["text-font"] = ["Noto Sans Regular"];
for (const style of [outdoor, preview]) {
  const errors = validateStyleMin(style);
  if (errors.length) throw new Error(errors.map(error => error.message).join("\n"));
}
await write("indoor.json", indoor);
await write("outdoor.json", outdoor);
await write("outdoor-preview.json", preview);
await writeFile(new URL("indoor.studio.ts", root), `// Minimal — Mappedin Studio indoor theme. Generated by npm run templates:build.\nconst theme = ${JSON.stringify(indoor, null, 2)};\n\nexport default theme;\nexport const colors = theme.colors;\n`);
console.log(`Minimal: generated and validated indoor theme + two ${outdoor.layers.length}-layer MapLibre styles in ${fileURLToPath(root)}`);
