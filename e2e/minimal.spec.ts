import { describe, test, expect } from "./utils/fixtures";
import { MaputnikDriver } from "./maputnik-driver";
import indoor from "../src/templates/minimal/indoor.json" with { type: "json" };
import outdoor from "../src/templates/minimal/outdoor.json" with { type: "json" };
import preview from "../src/templates/minimal/outdoor-preview.json" with { type: "json" };

const templateUrl = new URL("minimal.html", process.env.E2E_BASE_URL ?? "http://localhost:8888/").href;

describe("Minimal template", () => {
  const { given, get, when, then } = new MaputnikDriver();

  test("opens from the editor gallery with all layers", async () => {
    await given.setupMockBackedResponses();
    await when.setStyle("");
    await when.click("nav:open");
    await when.clickButtonByName("Minimal");
    await then(get.styleFromLocalStorage()).shouldDeepNestedInclude({ name: preview.name, layers: preview.layers });
  });

  for (const [kind, expected] of [["indoor", indoor], ["outdoor", outdoor]] as const) {
    test(`downloads valid ${kind} JSON`, async () => {
      await when.visit(templateUrl);
      const file = await when.downloadFile(`minimal:download-${kind}`);
      expect(file.name).toBe(`minimal.${kind}.json`);
      expect(JSON.parse(file.text)).toEqual(expected);
    });
  }

  test("downloads self-contained Studio TypeScript", async () => {
    await when.visit(templateUrl);
    const file = await when.downloadFile("minimal:download-studio");
    expect(file.name).toBe("minimal.indoor.ts");
    const json = file.text.match(/const theme = ([\s\S]*?);\s*export default theme;/)?.[1];
    expect(json).toBeDefined();
    expect(JSON.parse(json!)).toEqual(indoor);
  });
});
