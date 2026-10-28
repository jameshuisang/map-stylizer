import { DOORS, WALLS, type MapData, type MapView, type Space } from "@mappedin/mappedin-js";
import defaultTheme from "../templates/minimal/Minimal.json";
import type { IndoorTheme } from "../libs/indoor-theme";

export type RoomRole = keyof typeof defaultTheme.roomHeights;
export type RoomRoleResolver = (space: Space) => RoomRole;

/** Venue-specific roles belong in a resolver, never in English name matching. */
export function applyMinimalIndoor(
  mapView: MapView,
  mapData: MapData,
  resolveRole: RoomRoleResolver = space => space.type === "hallway" ? "hallway" : "standard",
  theme: IndoorTheme = defaultTheme
) {
  const { rooms, map } = theme.colors;
  for (const [target, height, color, opacity] of [[WALLS.Interior, theme.wallHeights.interior, rooms.interiorWall, theme.opacity.interiorWall], [WALLS.Exterior, theme.wallHeights.exterior, rooms.exteriorWall, theme.opacity.exteriorWall]] as const) {
    mapView.updateState(target, { color, topColor: map.geometry.wallTops, height, opacity: opacity / 100 });
  }
  for (const target of [DOORS.Interior, DOORS.Exterior]) {
    mapView.updateState(target, { visible: theme.showEntrances, color: rooms.doors, topColor: rooms.doors, opacity: theme.opacity.doors / 100 });
  }
  for (const floor of mapData.getByType("floor")) mapView.updateState(floor, { footprint: { color: rooms.hallway } });
  for (const space of mapData.getByType("space")) {
    // Preserve voids, exterior spaces, and openings in multi-floor geometry.
    if (space.type === "void" || space.type === "exterior" || space.type === "otb") continue;
    const role = resolveRole(space);
    mapView.updateState(space, {
      color: rooms[role], height: theme.roomHeights[role], opacity: theme.opacity[role] / 100,
      hoverColor: map.geometry.hover, interactive: true
    });
  }
  for (const object of mapData.getByType("object")) {
    mapView.updateState(object, { color: rooms.desk, topColor: rooms.desk, height: theme.objectHeight, opacity: theme.opacity.desk / 100 });
  }
}
