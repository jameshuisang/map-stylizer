import { beforeEach, describe, test } from "./utils/fixtures";
import { MaputnikDriver } from "./maputnik-driver";

describe("sidebar resize", () => {
  const { given, get, when, then } = new MaputnikDriver();

  beforeEach(async () => {
    await given.setupMockBackedResponses();
    await when.setStyle("layer");
  });

  test("dragging the outer handle widens the sidebar", async () => {
    const initialWidth = await get.elementWidth("sidebar-panel").get();

    await when.dragBy("sidebar-resize-handle", 100);

    await then(get.elementWidth("sidebar-panel")).shouldBeGreaterThan(initialWidth + 50);
  });

  test("dragging the inner handle increases the layer list height", async () => {
    const initialHeight = await get.elementHeight("layer-list-panel").get();

    await when.dragBy("inner-resize-handle", 0, 50);

    await then(get.elementHeight("layer-list-panel")).shouldBeGreaterThan(initialHeight + 20);
  });
});
