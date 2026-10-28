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
  const updateState = vi.fn();
  const data = { getByType: (type: string) => type === "space" ? spaces : [] } as unknown as MapData;
  const view = { updateState } as unknown as MapView;
  return { spaces, updateState, data, view };
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
});
