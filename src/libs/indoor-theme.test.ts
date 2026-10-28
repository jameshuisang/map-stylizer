import { describe, expect, it } from "vitest";
import defaultTheme from "../templates/minimal/Minimal.json";
import { isIndoorTheme, parseIndoorTheme, stripEmoji } from "./indoor-theme";

const candidate = () => ({ colors: { rooms: {}, map: {} } });

describe("indoor theme format", () => {
  it("detects structural anchors without confusing detection with validation", () => {
    expect(isIndoorTheme(candidate())).toBe(true);
    expect(isIndoorTheme({ colors: { rooms: { standard: "not a color" }, map: {} } })).toBe(true);
    for (const value of [null, [], { version: 8, sources: {}, layers: [] }, { colors: { rooms: {}, map: [] } }]) {
      expect(isIndoorTheme(value)).toBe(false);
    }
  });

  it("fills absent optional values while preserving valid imported values", () => {
    const imported = {
      name: "A custom theme",
      showEntrances: false,
      wallHeights: { interior: 0 },
      opacity: { standard: 37.5 },
      colors: { rooms: { standard: "rgb(10, 20, 30)" }, map: { background: "transparent" } }
    };
    const parsed = parseIndoorTheme(imported);
    expect(parsed).toEqual({
      ...defaultTheme,
      name: imported.name,
      showEntrances: false,
      wallHeights: { ...defaultTheme.wallHeights, interior: 0 },
      opacity: { ...defaultTheme.opacity, standard: 37.5 },
      colors: {
        ...defaultTheme.colors,
        rooms: { ...defaultTheme.colors.rooms, standard: "rgb(10, 20, 30)" },
        map: { ...defaultTheme.colors.map, background: "transparent" }
      }
    });
  });

  it("excludes unknown keys and does not mutate or share objects with its input or defaults", () => {
    const input = { ...candidate(), applicationState: { selectedRoom: "1" }, colors: { rooms: { standard: "red", typo: "blue" }, map: {} } };
    const original = structuredClone(input);
    const parsed = parseIndoorTheme(input);
    expect(input).toEqual(original);
    expect(parsed).not.toHaveProperty("applicationState");
    expect(parsed.colors.rooms).not.toHaveProperty("typo");
    parsed.colors.rooms.standard = "blue";
    parsed.colors.map.geometry.wallTops = "green";
    expect(input).toEqual(original);
    expect(parseIndoorTheme(candidate()).colors.map.geometry.wallTops).toBe(defaultTheme.colors.map.geometry.wallTops);
  });

  it.each([
    [null, "theme must be a JSON object"],
    [{ colors: {} }, "colors.rooms must be an object"],
    [{ colors: { rooms: {}, map: null } }, "colors.map must be an object"],
    [{ ...candidate(), showEntrances: "false" }, "showEntrances must be true or false"],
    [{ ...candidate(), roomHeights: { standard: -1 } }, "roomHeights.standard must be zero or greater"],
    [{ ...candidate(), wallHeights: { exterior: Number.POSITIVE_INFINITY } }, "wallHeights.exterior must be a finite number"],
    [{ ...candidate(), objectHeight: Number.NaN }, "objectHeight must be a finite number"],
    [{ ...candidate(), opacity: { standard: 101 } }, "opacity.standard must be between 0 and 100"],
    [{ ...candidate(), opacity: { standard: -1 } }, "opacity.standard must be between 0 and 100"],
    [{ ...candidate(), colors: { rooms: { standard: "var(--missing)" }, map: {} } }, "colors.rooms.standard must be a valid color"],
    [{ ...candidate(), colors: { rooms: { standard: 42 }, map: {} } }, "colors.rooms.standard must be a string"],
    [{ ...candidate(), colors: { rooms: {}, map: { geometry: [] } } }, "colors.map.geometry must be an object"]
  ])("rejects malformed supported values with a field path (%j)", (value, message) => {
    expect(() => parseIndoorTheme(value)).toThrow(message);
  });
});

describe("emoji-free display labels", () => {
  it.each([
    ["Office 101 💼", "Office 101"],
    ["Family 👨‍👩‍👧‍👦 room", "Family room"],
    ["Flags 🇨🇦 🇺🇸", "Flags"],
    ["Floor 1️⃣ - Room 203", "Floor - Room 203"],
    ["Choice ✌🏽", "Choice"],
    ["Room 101, #2 / 3* Café", "Room 101, #2 / 3* Café"],
    ["男性更衣室 / غرفة 12", "男性更衣室 / غرفة 12"]
  ])("normalizes %s without stripping ordinary text", (input, expected) => {
    expect(stripEmoji(input)).toBe(expected);
  });
});
