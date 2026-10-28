import React, { useEffect, useState } from "react";
import { Group, Panel, Separator, useDefaultLayout } from "react-resizable-panels";
import { ScrollContainer } from "./ScrollContainer";
import { useTranslation } from "react-i18next";
import { IconContext } from "react-icons";

const DEFAULT_SIDEBAR_WIDTH = 360;
const PANEL_STYLE: React.CSSProperties = { overflow: "hidden" };

const SIDEBAR_LAYOUT_ID = "map-stylizer:sidebar-layout-v2";
const SIDEBAR_INNER_LAYOUT_ID = "map-stylizer:sidebar-inner-layout-v2";
const SIDEBAR_PANEL_ID = "sidebar";
const MAP_PANEL_ID = "map";
const LIST_PANEL_ID = "list";
const DRAWER_PANEL_ID = "drawer";

type AppLayoutProps = {
  toolbar: React.ReactElement
  layerList: React.ReactElement
  layerEditor?: React.ReactElement
  codeEditor?: React.ReactElement
  map: React.ReactElement
  bottom?: React.ReactElement
  modals?: React.ReactNode
  compactList?: boolean
};

export const AppLayout: React.FC<AppLayoutProps> = (props) => {
  const { t, i18n } = useTranslation();

  const sidebarLayout = useDefaultLayout({
    id: SIDEBAR_LAYOUT_ID,
    panelIds: [SIDEBAR_PANEL_ID, MAP_PANEL_ID],
  });
  const innerLayoutId = props.compactList ? `${SIDEBAR_INNER_LAYOUT_ID}-compact` : SIDEBAR_INNER_LAYOUT_ID;
  const innerLayout = useDefaultLayout({
    id: innerLayoutId,
    panelIds: [LIST_PANEL_ID, DRAWER_PANEL_ID],
  });

  // The bottom panel is position: fixed, so it can't be a flex sibling of the
  // map panel; it follows the sidebar through this custom property instead.
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  useEffect(() => {
    document.body.dir = i18n.dir();
  }, [i18n, i18n.language]);

  return <IconContext.Provider value={{size: "14px"}}>
    <div
      className="maputnik-layout"
      style={{"--sidebar-width": `${sidebarWidth}px`} as React.CSSProperties}
    >
      {props.toolbar}
      <div className="maputnik-layout-main">
        <Group
          className="maputnik-layout-panels"
          orientation="horizontal"
          id={SIDEBAR_LAYOUT_ID}
          defaultLayout={sidebarLayout.defaultLayout}
          onLayoutChanged={sidebarLayout.onLayoutChanged}
        >
          <Panel
            id={SIDEBAR_PANEL_ID}
            data-wd-key="sidebar-panel"
            className={props.codeEditor ? "maputnik-layout-code-editor" : "maputnik-layout-sidebar"}
            style={PANEL_STYLE}
            defaultSize={`${DEFAULT_SIDEBAR_WIDTH}px`}
            minSize="280px"
            onResize={({inPixels}) => setSidebarWidth(inPixels)}
          >
            {props.codeEditor && <ScrollContainer>
              {props.codeEditor}
            </ScrollContainer>
            }
            {!props.codeEditor && <Group
              className="maputnik-layout-sidebar-panels"
              orientation="vertical"
              id={innerLayoutId}
              defaultLayout={innerLayout.defaultLayout}
              onLayoutChanged={innerLayout.onLayoutChanged}
            >
              <Panel
                id={LIST_PANEL_ID}
                data-wd-key="layer-list-panel"
                className="maputnik-layout-list"
                style={PANEL_STYLE}
                defaultSize={props.compactList ? "190px" : props.layerEditor ? "38%" : "100%"}
                minSize={props.compactList ? "140px" : "100px"}
                maxSize={props.compactList ? "240px" : undefined}
              >
                {props.layerList}
              </Panel>
              {props.layerEditor && <Separator
                className="maputnik-layout-resize-handle maputnik-layout-resize-handle--horizontal"
                data-wd-key="inner-resize-handle"
                title={t("Drag to resize the layer list")}
                aria-label={t("Drag to resize the layer list")}
              />}
              {props.layerEditor && <Panel
                id={DRAWER_PANEL_ID}
                className="maputnik-layout-drawer"
                style={PANEL_STYLE}
                defaultSize="62%"
                minSize="150px"
              >
                <ScrollContainer>
                  {props.layerEditor}
                </ScrollContainer>
              </Panel>}
            </Group>
            }
          </Panel>
          <Separator
            className="maputnik-layout-resize-handle"
            data-wd-key="sidebar-resize-handle"
            title={t("Drag to resize the sidebar")}
            aria-label={t("Drag to resize the sidebar")}
          />
          <Panel id={MAP_PANEL_ID} className="maputnik-layout-map" style={PANEL_STYLE} minSize="200px">
            {props.map}
          </Panel>
        </Group>
      </div>
      {props.bottom && <div className="maputnik-layout-bottom">
        {props.bottom}
      </div>
      }
      {props.modals}
    </div>
  </IconContext.Provider>;
};
