import { beforeEach, describe, test, expect } from "./utils/fixtures";
import { MaputnikDriver } from "./maputnik-driver";

describe("keyboard", () => {
  const { given, get, when, then } = new MaputnikDriver();

  beforeEach(async () => {
    await given.setupMockBackedResponses();
    await when.setStyle("both");
  });

  describe("shortcuts", () => {
    beforeEach(async () => {
      await given.setupMockBackedResponses();
      await when.setStyle("");
    });

    test("ESC closes the menu and restores trigger focus", async () => {
      const targetSelector = "view-option:map";
      await when.openMapMenu();
      await when.focus(targetSelector);
      await then(get.elementByTestId(targetSelector)).shouldBeFocused();
      await when.typeKeys("{esc}");
      await then(get.elementByTestId(targetSelector)).shouldNotExist();
      await then(get.elementByTestId("nav:map-menu")).shouldBeFocused();
    });

    test("'?' should show shortcuts modal", async () => {
      await when.typeKeys("?");
      await then(get.elementByTestId("modal:shortcuts")).shouldBeVisible();
    });

    test("'o' should show open modal", async () => {
      await when.typeKeys("o");
      await then(get.elementByTestId("modal:open")).shouldBeVisible();
    });

    test("'e' should show export modal", async () => {
      await when.typeKeys("e");
      await then(get.elementByTestId("modal:export")).shouldBeVisible();
    });

    test("'d' should show sources modal", async () => {
      await when.typeKeys("d");
      await then(get.elementByTestId("modal:sources")).shouldBeVisible();
    });

    test("'s' should show settings modal", async () => {
      await when.typeKeys("s");
      await then(get.elementByTestId("modal:settings")).shouldBeVisible();
    });

    test("'i' should change map to inspect mode", async () => {
      await when.typeKeys("i");
      await when.openMapMenu();
      await expect(get.elementByTestId("view-option:inspect")).toHaveAttribute("aria-checked", "true");
    });

    test("'m' should focus map", async () => {
      await when.typeKeys("m");
      await then(get.canvas()).shouldBeFocused();
    });

    test("'!' should show debug modal", async () => {
      await when.typeKeys("!");
      await then(get.elementByTestId("modal:debug")).shouldBeVisible();
    });

    describe("while the map has focus", () => {
      beforeEach(async () => {
        await when.typeKeys("m");
        await then(get.canvas()).shouldBeFocused();
      });

      test("'!' should show debug modal", async () => {
        await when.typeKeys("!");
        await then(get.elementByTestId("modal:debug")).shouldBeVisible();
      });

      test("'s' should show settings modal", async () => {
        await when.typeKeys("s");
        await then(get.elementByTestId("modal:settings")).shouldBeVisible();
      });
    });
  });
});
