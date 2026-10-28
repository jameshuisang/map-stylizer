import type { Space } from "@mappedin/mappedin-js";
import { stripEmoji } from "../libs/indoor-theme";
import type { RoomRole } from "./apply-indoor";

// Explicit labels in the public Office Demo only, not a venue classifier.
// Production integrations should resolve roles from their own space IDs/metadata.
const officeRoles: Record<string, RoomRole> = {
  "Men's Washroom": "bathroom",
  "Women's Washroom": "bathroom",
  "Electrical Room": "inaccessible",
  "Custodial": "inaccessible"
};
export function officeDemoRole(space: Space): RoomRole {
  return officeRoles[stripEmoji(space.name || "")] ?? (space.type === "hallway" ? "hallway" : "standard");
}
