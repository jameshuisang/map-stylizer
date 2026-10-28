import { beforeEach, describe, test, expect } from "./utils/fixtures";
import { MaputnikDriver } from "./maputnik-driver";

describe("i18n", () => {
  const { given, get, when, then } = new MaputnikDriver();

  beforeEach(async () => {
    await given.setupMockBackedResponses();
    await when.setStyle("both");
  });

  describe("language detector", () => {
    test("English", async () => {
      await when.visit("?lng=en");
      await when.openLanguageMenu();
      await expect(get.elementByTestId("language:en")).toHaveAttribute("aria-checked", "true");
    });

    test("Japanese", async () => {
      await when.visit("?lng=ja");
      await when.openLanguageMenu();
      await expect(get.elementByTestId("language:ja")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("language switcher", () => {
    beforeEach(async () => {
      await when.setStyle("layer");
    });

    test("the language switcher switches to Japanese", async () => {
      await when.setLanguage("ja");

      await when.typeKeys("{esc}");
      await when.openMapMenu();
      await then(get.elementByTestId("nav:settings")).shouldHaveText("スタイル設定");
    });
  });
});
