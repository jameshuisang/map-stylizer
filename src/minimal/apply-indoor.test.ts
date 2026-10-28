import { describe, expect, it, vi } from "vitest";
import type { MapData, MapView, Space } from "@mappedin/mappedin-js";
import theme from "../templates/minimal/indoor.json";
import { applyMinimalIndoor } from "./apply-indoor";
vi.mock("@mappedin/mappedin-js", () => ({
  WALLS: { Interior: "interior-walls", Exterior: "exterior-walls" },
  DOORS: { Interior: "interior-doors", Exterior: "exterior-doors" }
}));

function fixture() {
  const spaces = ["room", "hallway", "void", "exterior", "otb"].map((type, id) => ({ type, id: String(id) })) as Space[];
  const objects = [{ id: "object-1" }];
  const floors = [{ id: "floor-1" }];
  const updateState = vi.fn();
  const data = { getByType: (type: string) => type === "space" ? spaces : type === "object" ? objects : type === "floor" ? floors : [] } as unknown as MapData;
  const view = { updateState } as unknown as MapView;
  return { spaces, objects, floors, updateState, data, view };
}

describe("Minimal indoor adapter", () => {
  it("preserves void, exterior and open-to-below spaces", () => {
    const { spaces, updateState, data, view } = fixture();
    applyMinimalIndoor(view, data);
    for (const space of spaces.slice(2)) expect(updateState).not.toHaveBeenCalledWith(space, expect.anything());
  });
  it("uses venue role IDs without guessing from English room names", () => {
    const { spaces, updateState, data, view } = fixture();
    applyMinimalIndoor(view, data, space => space.id === "0" ? "bathroom" : "hallway");
    expect(updateState).toHaveBeenCalledWith(spaces[0], expect.objectContaining({ color: theme.colors.rooms.bathroom }));
    expect(updateState).toHaveBeenCalledWith(spaces[1], expect.objectContaining({ color: theme.colors.rooms.hallway }));
  });
  it("uses imported space colors, heights and opacity rather than the built-in theme", () => {
    const { spaces, updateState, data, view } = fixture();
    const imported = structuredClone(theme);
    imported.colors.rooms.bathroom = "#123456";
    imported.roomHeights.bathroom = 2.25;
    imported.opacity.bathroom = 37.5;
    imported.colors.map.geometry.hover = "#abcdef";
    applyMinimalIndoor(view, data, () => "bathroom", imported);
    expect(updateState).toHaveBeenCalledWith(spaces[0], {
      color: "#123456", height: 2.25, opacity: 0.375,
      hoverColor: "#abcdef", interactive: true
    });
  });

  it("converts imported wall, door and object percentages to renderer opacity", () => {
    const { objects, updateState, data, view } = fixture();
    const imported = structuredClone(theme);
    imported.opacity.interiorWall = 10;
    imported.opacity.exteriorWall = 25;
    imported.opacity.doors = 50;
    imported.opacity.desk = 75;
    applyMinimalIndoor(view, data, undefined, imported);
    expect(updateState).toHaveBeenCalledWith("interior-walls", expect.objectContaining({ opacity: 0.1 }));
    expect(updateState).toHaveBeenCalledWith("exterior-walls", expect.objectContaining({ opacity: 0.25 }));
    expect(updateState).toHaveBeenCalledWith("interior-doors", expect.objectContaining({ opacity: 0.5 }));
    expect(updateState).toHaveBeenCalledWith("exterior-doors", expect.objectContaining({ opacity: 0.5 }));
    expect(updateState).toHaveBeenCalledWith(objects[0], expect.objectContaining({ opacity: 0.75 }));
  });

  it("preserves independent imported wall colors and door visibility", () => {
    const { updateState, data, view } = fixture();
    const imported = structuredClone(theme);
    imported.colors.rooms.wall = "#999999";
    imported.colors.rooms.interiorWall = "#112233";
    imported.colors.rooms.exteriorWall = "#445566";
    imported.colors.map.geometry.wallTops = "#778899";
    imported.showEntrances = false;
    applyMinimalIndoor(view, data, undefined, imported);
    expect(updateState).toHaveBeenCalledWith("interior-walls", expect.objectContaining({ color: "#112233", topColor: "#778899" }));
    expect(updateState).toHaveBeenCalledWith("exterior-walls", expect.objectContaining({ color: "#445566", topColor: "#778899" }));
    expect(updateState).toHaveBeenCalledWith("interior-doors", expect.objectContaining({ visible: false }));
    expect(updateState).toHaveBeenCalledWith("exterior-doors", expect.objectContaining({ visible: false }));
  });

  it("does not modify imported theme data when applying renderer state", () => {
    const { data, view } = fixture();
    const imported = structuredClone(theme);
    const original = structuredClone(imported);
    applyMinimalIndoor(view, data, undefined, imported);
    expect(imported).toEqual(original);
  });
});
