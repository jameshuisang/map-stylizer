import { getMapData, show3dMap, type Space } from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/index.css";
import "./preview.css";
import { applyMinimalIndoor } from "./apply-indoor";
import palette from "../templates/minimal/palette.json";
import theme from "../templates/minimal/indoor.json";
import studioSource from "../templates/minimal/indoor.studio.ts?raw";

const indoorUrl = new URL("../templates/minimal/indoor.json", import.meta.url).href;
const outdoorUrl = new URL("../templates/minimal/outdoor.json", import.meta.url).href;
const previewUrl = new URL("../templates/minimal/outdoor-preview.json", import.meta.url).href;
const studioUrl = URL.createObjectURL(new Blob([studioSource], { type: "text/plain" }));
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
element<HTMLAnchorElement>("download-indoor").href = indoorUrl;
element<HTMLAnchorElement>("download-outdoor").href = outdoorUrl;
element<HTMLAnchorElement>("download-studio").href = studioUrl;
const editorUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
editorUrl.searchParams.set("style", previewUrl);
element<HTMLAnchorElement>("editor-link").href = editorUrl.href;
for (const role of ["canvas", "building", "water", "park", "text", "accent"] as const) {
  const swatch = document.createElement("div");
  swatch.className = "swatch";
  swatch.style.backgroundColor = palette.colors[role];
  swatch.title = `${role}: ${palette.colors[role]}`;
  swatch.setAttribute("role", "img");
  swatch.setAttribute("aria-label", swatch.title);
  element("palette").append(swatch);
}
const status = element("status");
const floorSelect = element<HTMLSelectElement>("floor");
const retry = element<HTMLButtonElement>("retry");
const roomSelect = element<HTMLSelectElement>("room");
const selectionHint = element("selection-hint");
let loading = false;
let currentView: Awaited<ReturnType<typeof show3dMap>> | undefined;

async function load() {
  if (loading) return;
  loading = true;
  delete document.documentElement.dataset.mapReady;
  retry.hidden = true;
  status.hidden = false;
  status.textContent = "Loading the Mappedin demo…";
  floorSelect.disabled = true;
  roomSelect.disabled = true;
  try {
    // Public demo credentials published by Mappedin, not private project credentials.
    // Terms: https://developer.mappedin.com/docs/demo-keys-and-maps
    const mapData = await getMapData({
      key: "mik_yeBk0Vf0nNJtpesfu560e07e5",
      secret: "mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022",
      mapId: "64ef49e662fd90fe020bee61"
    });
    const mapView = await show3dMap(element<HTMLDivElement>("map"), mapData, {
      outdoorView: { style: outdoorUrl }
    });
    currentView = mapView;
    applyMinimalIndoor(mapView, mapData);
    for (const space of mapData.getByType("space")) {
      if (space.name && space.type === "room") {
        mapView.Labels.add(space, space.name, { appearance: { color: theme.colors.map.labels.default, textSize: 12, outlineColor: theme.colors.map.labels.defaultOutline } });
      }
    }
    let selected: Space | undefined;
    function selectRoom(space: Space | undefined) {
      if (selected) mapView.updateState(selected, { color: theme.colors.rooms.standard });
      selected = space;
      if (selected) mapView.updateState(selected, { color: theme.colors.map.geometry.highlight });
      roomSelect.value = selected?.id ?? "";
      selectionHint.textContent = selected ? `Selected: ${selected.name}` : "Drag to explore. Choose a room to see its selection color.";
    }
    function updateRooms() {
      selectRoom(undefined);
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Choose a room";
      roomSelect.replaceChildren(placeholder, ...mapData.getByType("space")
        .filter(space => space.type === "room" && space.name && space.floor.id === mapView.currentFloor.id)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(space => {
          const option = document.createElement("option");
          option.value = space.id;
          option.textContent = space.name;
          return option;
        }));
      roomSelect.disabled = false;
    }
    mapView.on("click", event => selectRoom(event.spaces?.find(space => space.type === "room")));
    roomSelect.onchange = () => selectRoom(mapData.getById("space", roomSelect.value));
    updateRooms();
    floorSelect.replaceChildren(...mapData.getByType("floor").map(floor => {
      const option = document.createElement("option");
      option.value = floor.id;
      option.textContent = floor.name;
      option.selected = floor.id === mapView.currentFloor.id;
      return option;
    }));
    floorSelect.disabled = false;
    floorSelect.onchange = () => {
      const floor = mapData.getById("floor", floorSelect.value);
      if (floor) void mapView.setFloor(floor.id);
    };
    mapView.on("floor-change", event => { floorSelect.value = event.floor.id; updateRooms(); });
    status.hidden = true;
    document.documentElement.dataset.mapReady = "true";
  } catch (error) {
    currentView?.destroy();
    currentView = undefined;
    status.textContent = "The demo map couldn’t load. Check your connection and try again. You can still download the template files.";
    retry.hidden = false;
    console.error("Minimal demo failed to load", error);
  } finally {
    loading = false;
  }
}
retry.addEventListener("click", () => { void load(); });
void load();
