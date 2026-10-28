import Color from "color";
import defaultTheme from "../templates/minimal/Minimal.json";

export type IndoorTheme = typeof defaultTheme;
type ThemeValue = string | number | boolean | { [key: string]: ThemeValue };
type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** Detects the indoor format only; call parseIndoorTheme before using its values. */
export function isIndoorTheme(value: unknown): boolean {
  return isObject(value) && isObject(value.colors) &&
    isObject(value.colors.rooms) && isObject(value.colors.map);
}

function invalid(path: string, requirement: string): never {
  throw new Error(`Invalid indoor theme: ${path} ${requirement}.`);
}

function parseValue(value: unknown, fallback: ThemeValue, path: string): ThemeValue {
  if (typeof fallback === "object") {
    if (!isObject(value)) invalid(path, "must be an object");
    const result: Record<string, ThemeValue> = {};
    for (const [key, defaultValue] of Object.entries(fallback)) {
      const childPath = path ? `${path}.${key}` : key;
      result[key] = Object.prototype.hasOwnProperty.call(value, key)
        ? parseValue(value[key], defaultValue, childPath)
        : structuredClone(defaultValue);
    }
    return result;
  }

  if (typeof fallback === "boolean") {
    if (typeof value !== "boolean") invalid(path, "must be true or false");
    return value;
  }

  if (typeof fallback === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) invalid(path, "must be a finite number");
    if (path.startsWith("opacity.")) {
      if (value < 0 || value > 100) invalid(path, "must be between 0 and 100");
    } else if (value < 0) {
      invalid(path, "must be zero or greater");
    }
    return value;
  }

  if (typeof value !== "string") invalid(path, "must be a string");
  if (path.startsWith("colors.")) {
    try {
      Color(value.trim());
    } catch {
      invalid(path, "must be a valid color, such as #0071e3 or rgb(0, 113, 227)");
    }
  }
  return value;
}

/**
 * Validates supported fields and fills omitted fields without changing the input.
 * Unknown keys are excluded so exports remain clean native indoor-theme JSON.
 */
export function parseIndoorTheme(value: unknown): IndoorTheme {
  if (!isObject(value)) invalid("theme", "must be a JSON object");
  if (!isObject(value.colors)) invalid("colors", "must be an object containing rooms and map");
  if (!isObject(value.colors.rooms)) invalid("colors.rooms", "must be an object");
  if (!isObject(value.colors.map)) invalid("colors.map", "must be an object");
  return parseValue(value, defaultTheme, "") as IndoorTheme;
}

/** Removes emoji presentation from display labels without changing venue data. */
export function stripEmoji(text: string): string {
  return text
    // Remove the complete keycap sequence first, including its digit or symbol.
    .replace(/[0-9#*]\uFE0F?\u20E3/gu, "")
    .replace(/\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Regional_Indicator}|\u200D|\uFE0E|\uFE0F|\u20E3|[\u{E0020}-\u{E007F}]/gu, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
}
