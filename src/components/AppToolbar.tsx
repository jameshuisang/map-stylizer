import React from "react";
import { detect } from "detect-browser";
import { withTranslation, type WithTranslation } from "react-i18next";
import { MdArrowDownward, MdChevronRight, MdExpandMore, MdFileUpload, MdMap, MdMoreHoriz, MdUndo, MdRedo } from "react-icons/md";
import { supportedLanguages } from "../i18n";
import type { OnStyleChangedCallback } from "../libs/definitions";
import { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "./toolcraft";

const browser = detect();
const colorAccessibilityFiltersEnabled = ["chrome", "firefox"].includes(browser?.name ?? "");
export type ModalTypes = "settings" | "sources" | "open" | "shortcuts" | "export" | "debug" | "globalState" | "codeEditor";
export type MapState = "map" | "inspect" | "filter-achromatopsia" | "filter-deuteranopia" | "filter-protanopia" | "filter-tritanopia";

export type AppToolbarProps = {
  mapStyle: object
  inspectModeEnabled: boolean
  onStyleChanged: OnStyleChangedCallback
  onStyleOpen: OnStyleChangedCallback
  sources: object
  children?: React.ReactNode
  onToggleModal(modal: ModalTypes): void
  onSetMapState(mapState: MapState): unknown
  mapState?: MapState
  renderer?: string
  documentName?: string
  documentKind?: "outdoor" | "indoor"
  onUndo?(): void
  onRedo?(): void
  canUndo?: boolean
  canRedo?: boolean
};

type Props = AppToolbarProps & WithTranslation;

function AppToolbarInternal(props: Props) {
  const { t } = props;
  const kind = props.documentKind ?? "outdoor";
  const documentName = props.documentName || (props.mapStyle as { name?: string }).name || t("Untitled style");
  const skipTo = (target: string) => {
    const selector = target === "map" ? ".maplibregl-canvas, .indoor-canvas-host canvas" : target === "layer-list" ? "#skip-target-layer-list, .indoor-categories button" : "#skip-target-layer-editor, .indoor-inspector input";
    const element = document.querySelector<HTMLElement>(selector);
    if (element?.tagName === "CANVAS" && element.tabIndex < 0) element.tabIndex = -1;
    element?.focus();
  };
  const modalItem = (modal: ModalTypes, label: string, testId: string) => <DropdownMenuItem
    key={modal}
    data-wd-key={testId}
    onClick={() => props.onToggleModal(modal)}
  >{label}<MdChevronRight aria-hidden="true" /></DropdownMenuItem>;

  return <nav className="maputnik-toolbar workspace-toolbar" aria-label={t("Editor toolbar")}>
    <div className="workspace-toolbar__brand">
      <button data-wd-key="root:skip:layer-list" className="maputnik-toolbar-skip" onClick={() => skipTo("layer-list")}>{t("Layers list")}</button>
      <button data-wd-key="root:skip:layer-editor" className="maputnik-toolbar-skip" onClick={() => skipTo("layer-editor")}>{t("Layer editor")}</button>
      <button data-wd-key="root:skip:map-view" className="maputnik-toolbar-skip" onClick={() => skipTo("map")}>{t("Map view")}</button>
      <MdMap className="workspace-toolbar__mark" aria-hidden="true" />
      <span>Map Stylizer</span>
    </div>
    <div className="workspace-toolbar__document">
      <span className="workspace-toolbar__document-name" title={documentName}>{documentName}</span>
      <span className="workspace-toolbar__format">{kind === "indoor" ? t("Indoor") : t("Outdoor")}</span>
    </div>
    <div className="workspace-toolbar__actions" role="navigation" aria-label={t("Toolbar")}>
      {props.onUndo && <Button variant="ghost" size="icon-sm" aria-label={t("Undo")} title={t("Undo")} disabled={!props.canUndo} onClick={props.onUndo}><MdUndo aria-hidden="true" /></Button>}
      {props.onRedo && <Button variant="ghost" size="icon-sm" aria-label={t("Redo")} title={t("Redo")} disabled={!props.canRedo} onClick={props.onRedo}><MdRedo aria-hidden="true" /></Button>}
      {kind === "outdoor" && <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="sm" data-wd-key="nav:map-menu" />}>
          {t("Map")}<MdExpandMore aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="workspace-menu">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("Preview")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={props.mapState ?? "map"} onValueChange={value => props.onSetMapState(value as MapState)} data-wd-key="nav:inspect">
              <DropdownMenuRadioItem value="map" data-wd-key="view-option:map">{t("Map")}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="inspect" data-wd-key="view-option:inspect" disabled={props.renderer === "ol"}>{t("Inspect")}</DropdownMenuRadioItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger data-wd-key="nav:accessibility">{t("Color accessibility")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="workspace-menu">
                  {["deuteranopia", "protanopia", "tritanopia", "achromatopsia"].map(filter => <DropdownMenuRadioItem key={filter} value={`filter-${filter}`} disabled={!colorAccessibilityFiltersEnabled}>{t(`${filter[0].toUpperCase()}${filter.slice(1)} filter`)}</DropdownMenuRadioItem>)}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          {kind === "outdoor" && <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t("Map configuration")}</DropdownMenuLabel>
              {modalItem("sources", t("Data Sources"), "nav:sources")}
              {modalItem("settings", t("Style Settings"), "nav:settings")}
            </DropdownMenuGroup>
          </>}
        </DropdownMenuContent>
      </DropdownMenu>}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="sm" data-wd-key="nav:tools-menu" />}>
          <MdMoreHoriz aria-hidden="true" /><span>{t("Tools")}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="workspace-menu">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("Advanced editing")}</DropdownMenuLabel>
            {modalItem("codeEditor", t("Edit JSON"), "nav:code-editor")}
            {kind === "outdoor" && modalItem("globalState", t("Global state"), "nav:global-state")}
            {kind === "outdoor" && modalItem("debug", t("Map diagnostics"), "nav:debug")}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("Workspace")}</DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-wd-key="nav:language">{t("Language")}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="workspace-menu">
                <DropdownMenuRadioGroup value={props.i18n.resolvedLanguage ?? props.i18n.language} onValueChange={value => { void props.i18n.changeLanguage(value); }}>
                  {Object.entries(supportedLanguages).map(([code, name]) => <DropdownMenuRadioItem key={code} value={code} data-wd-key={`language:${code}`}>{name}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {kind === "outdoor" && modalItem("shortcuts", t("Keyboard shortcuts"), "nav:shortcuts")}
            <DropdownMenuItem render={<a href={kind === "indoor" ? "https://developer.mappedin.com/docs/tools/mappedin-studio" : "https://github.com/maplibre/maputnik/wiki"} target="_blank" rel="noreferrer" />} data-wd-key="toolbar:link">{t("Help and documentation")}<MdChevronRight aria-hidden="true" /></DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="workspace-toolbar__divider" />
      <Button variant="outline" size="sm" data-wd-key="nav:open" onClick={() => props.onToggleModal("open")}><MdFileUpload aria-hidden="true" />{t("Import")}</Button>
      <Button size="sm" data-wd-key="nav:export" onClick={() => props.onToggleModal("export")}><MdArrowDownward aria-hidden="true" />{t("Export JSON")}</Button>
    </div>
  </nav>;
}

export const AppToolbar = withTranslation()(AppToolbarInternal);
