import { describe, test, expect } from "./utils/fixtures";
import { MaputnikDriver } from "./maputnik-driver";
import indoor from "../src/templates/minimal/Minimal.json" with { type: "json" };
import outdoor from "../src/templates/minimal/Minimal.outdoor.json" with { type: "json" };

const base = process.env.E2E_BASE_URL ?? "http://localhost:8888/";
describe("integrated Minimal editor", () => {
  const { given, get, when, then } = new MaputnikDriver();

  test("imports the clean indoor JSON through the editor file picker", async () => {
    await given.setupMockBackedResponses();
    await when.setStyle("both");
    await when.click("nav:open");
    await when.openJsonFile(indoor, "modal:open.dropzone");
    await then(get.elementByTestId("indoor:workspace")).shouldBeVisible();
    await then(get.elementByTestId("indoor:hex-colors.rooms.standard")).shouldHaveValue(indoor.colors.rooms.standard);
  });

  test("edits and exports indoor JSON without preview or venue data", async () => {
    await when.visit(new URL("?template=minimal", base).href);
    await when.setValue("indoor:hex-colors.rooms.standard", "#e8e8ed");
    await when.tab();
    const file = await when.downloadFile("nav:export");
    expect(file.name).toBe("Minimal.json");
    const expected = structuredClone(indoor);
    expected.colors.rooms.standard = "#e8e8ed";
    expect(JSON.parse(file.text)).toEqual(expected);
    expect(file.text).not.toMatch(/mik_|mis_|mapId|demo|Extended_Pictographic/);
  });

  test("keeps geometry settings collapsed until requested", async () => {
    await when.visit(new URL("?template=minimal", base).href);
    await then(get.elementByTestId("indoor:geometry-height")).shouldNotExist();
    await when.clickButtonByName("Geometry & height");
    await then(get.elementByTestId("indoor:geometry-height")).shouldBeVisible();
  });

  test("imports a public outdoor style from the same indoor workspace", async () => {
    await when.visit(new URL("?template=minimal", base).href);
    await when.click("nav:open");
    await when.openJsonFile(outdoor, "modal:open.dropzone");
    await then(get.elementByTestId("indoor:workspace")).shouldNotExist();
    await then(get.styleFromLocalStorage()).shouldDeepNestedInclude({ name: outdoor.name, layers: outdoor.layers });
  });

  test("rejects malformed indoor colors without replacing the document", async () => {
    await when.visit(new URL("?template=minimal", base).href);
    await when.click("nav:open");
    const invalid = structuredClone(indoor);
    invalid.colors.rooms.standard = "not-a-color";
    await when.openJsonFile(invalid, "modal:open.dropzone");
    await then(get.elementByTestId("modal:open")).shouldContainText("colors.rooms.standard");
    await then(get.elementByTestId("indoor:workspace")).shouldExist();
  });
});
