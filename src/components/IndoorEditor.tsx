import { useEffect, useRef, useState } from "react";
import Color from "color";
import { getMapData, show3dMap, type MapData, type MapView, type Space } from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/index.css";
import { AppToolbar } from "./AppToolbar";
import { AppLayout } from "./AppLayout";
import { ModalOpen } from "./modals/ModalOpen";
import { Modal } from "./modals/Modal";
import { InputJson } from "./InputJson";
import { Button, Input, Accordion, AccordionItem, AccordionTrigger, AccordionContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./toolcraft";
import { officeDemoRole } from "../minimal/office-demo-role";
import { applyMinimalIndoor, type RoomRole } from "../minimal/apply-indoor";
import { parseIndoorTheme, stripEmoji, type IndoorTheme } from "../libs/indoor-theme";
import "./IndoorEditor.css";

type Props = {
  theme: IndoorTheme;
  onChange(theme: IndoorTheme): void;
  onImportOutdoor(...args: unknown[]): unknown;
  onUndo(): void;
  onRedo(): void;
  canUndo: boolean;
  canRedo: boolean;
};
const groups = ["Spaces", "Structure", "Labels", "Interaction"] as const;
type Group = typeof groups[number];
const colorFields: Record<Group, [string, string][]> = {
  Spaces: [["Room", "colors.rooms.standard"], ["Hallway", "colors.rooms.hallway"], ["Bathroom", "colors.rooms.bathroom"], ["Connection", "colors.rooms.connection"], ["Inaccessible", "colors.rooms.inaccessible"]],
  Structure: [["Interior walls", "colors.rooms.interiorWall"], ["Exterior walls", "colors.rooms.exteriorWall"], ["Wall tops", "colors.map.geometry.wallTops"], ["Objects", "colors.rooms.desk"], ["Doors", "colors.rooms.doors"]],
  Labels: [["Primary text", "colors.map.labels.default"], ["Label outline", "colors.map.labels.defaultOutline"]],
  Interaction: [["Selected space", "colors.map.geometry.highlight"], ["Hover", "colors.map.geometry.hover"]]
};
function at(theme: IndoorTheme, path: string): string | number {
  return path.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown>)[key], theme) as string | number;
}
function changed(theme: IndoorTheme, path: string, value: string | number): IndoorTheme {
  const copy = structuredClone(theme);
  const parts = path.split(".");
  const parent = parts.slice(0, -1).reduce<unknown>((result, key) => (result as Record<string, unknown>)[key], copy) as Record<string, unknown>;
  parent[parts[parts.length - 1]] = value;
  if (path === "roomHeight" && copy.roomHeightsLinked) {
    for (const key of Object.keys(copy.roomHeights) as (keyof typeof copy.roomHeights)[]) copy.roomHeights[key] = Number(value);
  }
  if (path === "colors.rooms.wall") { copy.colors.rooms.interiorWall = String(value); copy.colors.rooms.exteriorWall = String(value); }
  return parseIndoorTheme(copy);
}

function IndoorCanvas({ theme }: { theme: IndoorTheme }) {
  const host = useRef<HTMLDivElement>(null);
  const liveTheme = useRef(theme);
  const view = useRef<MapView | null>(null);
  const data = useRef<MapData | null>(null);
  const selected = useRef<Space | undefined>(undefined);
  const roleOverrides = useRef(new Map<string, RoomRole>());
  const rolePreview = useRef(false);
  const [previewRole, setPreviewRole] = useState<RoomRole>("standard");
  const resolveRole = (space: Space) => roleOverrides.current.get(space.id) ?? officeDemoRole(space);
  const [floorId, setFloorId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  liveTheme.current = theme;
  const selectRoom = (space?: Space) => {
    if (!view.current) return;
    if (selected.current) view.current.updateState(selected.current, { color: liveTheme.current.colors.rooms[resolveRole(selected.current)] });
    selected.current = space;
    rolePreview.current = false;
    if (space) setPreviewRole(resolveRole(space));
    setSelectedId(space?.id ?? "");
    if (space) view.current.updateState(space, { color: liveTheme.current.colors.map.geometry.highlight });
  };
  const refresh = () => {
    if (!view.current || !data.current) return;
    applyMinimalIndoor(view.current, data.current, resolveRole, liveTheme.current);
    view.current.Labels.removeAll();
    for (const space of data.current.getByType("space")) {
      const name = stripEmoji(space.name || "");
      if (name && space.type === "room") view.current.Labels.add(space, name, { appearance: { color: liveTheme.current.colors.map.labels.default, outlineColor: liveTheme.current.colors.map.labels.defaultOutline, textSize: 12 } });
    }
    if (selected.current && !rolePreview.current) view.current.updateState(selected.current, { color: liveTheme.current.colors.map.geometry.highlight });
  };
  useEffect(() => { refresh(); }, [theme]); // Changes apply to the existing renderer, never reload venue data.
  useEffect(() => {
    let cancelled = false;
    let created: MapView | undefined;
    setReady(false);
    setError("");
    void (async () => {
      try {
        // Published public Mappedin demo credentials. No customer venue credentials are stored.
        const mapData = await getMapData({ key: "mik_yeBk0Vf0nNJtpesfu560e07e5", secret: "mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022", mapId: "64ef49e662fd90fe020bee61" });
        if (cancelled || !host.current) return;
        created = await show3dMap(host.current, mapData, { outdoorView: { style: new URL("../templates/minimal/outdoor.json", import.meta.url).href } });
        if (cancelled) { created.destroy(); return; }
        view.current = created;
        data.current = mapData;
        refresh();
        setFloorId(created.currentFloor.id);
        created.on("floor-change", event => { setFloorId(event.floor.id); selectRoom(); });
        created.on("click", event => selectRoom(event.spaces?.find(space => space.type === "room")));
        setReady(true);
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "The demo map could not load.");
      }
    })();
    return () => { cancelled = true; created?.destroy(); view.current = null; data.current = null; };
  }, [attempt]);
  const floors = ready ? data.current?.getByType("floor") ?? [] : [];
  const rooms = ready ? (data.current?.getByType("space") ?? []).filter(space => space.type === "room" && space.name && space.floor.id === floorId) : [];
  return <section className="indoor-canvas" aria-label="Map preview" data-wd-key="indoor:canvas" data-ready={ready}>
    <div className="indoor-canvas-host" ref={host} />
    {ready && <div className="indoor-map-controls">
      <div><label id="indoor-floor-label">Floor</label><Select value={floorId} onValueChange={value => { if (value) void view.current?.setFloor(value); }}><SelectTrigger aria-labelledby="indoor-floor-label" data-wd-key="indoor:floor"><SelectValue>{stripEmoji(floors.find(f => f.id === floorId)?.name ?? "")}</SelectValue></SelectTrigger><SelectContent>{floors.map(floor => <SelectItem key={floor.id} value={floor.id}>{stripEmoji(floor.name)}</SelectItem>)}</SelectContent></Select></div>
      <div><label id="indoor-room-label">Inspect space</label><Select value={selectedId} onValueChange={value => selectRoom(rooms.find(room => room.id === value))}><SelectTrigger aria-labelledby="indoor-room-label" data-wd-key="indoor:room"><SelectValue>{stripEmoji(rooms.find(room => room.id === selectedId)?.name ?? "Choose a space")}</SelectValue></SelectTrigger><SelectContent><SelectItem value="">None</SelectItem>{rooms.map(room => <SelectItem key={room.id} value={room.id}>{stripEmoji(room.name)}</SelectItem>)}</SelectContent></Select></div>
      {selectedId && <div><label id="indoor-role-label">Preview role</label><Select value={previewRole} onValueChange={value => { if (value && selected.current) { roleOverrides.current.set(selected.current.id, value as RoomRole); rolePreview.current = true; setPreviewRole(value as RoomRole); refresh(); } }}><SelectTrigger aria-labelledby="indoor-role-label"><SelectValue>{previewRole}</SelectValue></SelectTrigger><SelectContent>{Object.keys(theme.roomHeights).map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select></div>}
    </div>}
    {!ready && <div className="indoor-map-status" role="status">{error ? <><strong>Map preview unavailable</strong><p>{error}</p><Button onClick={() => setAttempt(value => value + 1)}>Retry preview</Button><p>You can still edit and export your JSON.</p></> : "Loading map…"}</div>}
    <div className="indoor-map-caption">Office demo <span>·</span> Mappedin</div>
    <span className="indoor-sr-only" role="status">{selectedId ? `Selected ${stripEmoji(selected.current?.name ?? "space")}` : "No space selected"}</span>
  </section>;
}

export function IndoorEditor(props: Props) {
  const [group, setGroup] = useState<Group>("Spaces");
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState(false);
  const [error, setError] = useState("");
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(props.theme, null, 2) + "\n"], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = `${stripEmoji(props.theme.name).replace(/[^a-zA-Z0-9_-]/g, "-") || "style"}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const update = (path: string, value: string | number) => {
    try { props.onChange(changed(props.theme, path, value)); setError(""); }
    catch (reason) { setError((reason as Error).message); }
  };
  const toolbar = <AppToolbar documentName={stripEmoji(props.theme.name)} documentKind="indoor" mapStyle={props.theme} sources={{}} inspectModeEnabled={false} onSetMapState={() => {}} onStyleChanged={() => {}} onStyleOpen={() => {}} onToggleModal={modal => { if (modal === "open") setOpen(true); else if (modal === "export") exportJson(); else if (modal === "codeEditor") setJson(true); }} onUndo={props.onUndo} onRedo={props.onRedo} canUndo={props.canUndo} canRedo={props.canRedo} />;
  const categories = <div className="indoor-categories"><div className="indoor-section-heading"><span>Appearance</span><span>Indoor theme</span></div><nav aria-label="Theme sections">{groups.map(name => <Button variant="ghost" key={name} onClick={() => setGroup(name)} aria-pressed={group === name} data-wd-key={`indoor:group-${name}`}>{name}</Button>)}</nav><p>Changes apply to the map as you edit.</p></div>;
  const inspector = <div className="indoor-inspector"><h2>{group}</h2><p className="indoor-hint">{group === "Spaces" ? "Set the surfaces that shape the map." : group === "Structure" ? "Keep geometry clear and unobtrusive." : group === "Labels" ? "Create a readable hierarchy." : "Use blue to make active states clear."}</p>
    {colorFields[group].map(([label, path]) => <div className="indoor-color-field" key={path}><label htmlFor={`color-${path}`}>{label}</label><div><input id={`color-${path}`} aria-label={label} data-wd-key={`indoor:color-${path}`} type="color" value={Color(String(at(props.theme, path))).hex()} onChange={event => update(path, event.target.value)} /><Input key={String(at(props.theme, path))} aria-label={`${label} hex`} data-wd-key={`indoor:hex-${path}`} defaultValue={String(at(props.theme, path))} onBlur={event => update(path, event.target.value)} onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} /></div></div>)}
    {error && <p className="indoor-error" role="alert">{error}</p>}
    <Accordion><AccordionItem value="geometry"><AccordionTrigger>Geometry &amp; height</AccordionTrigger><AccordionContent>{[...(props.theme.roomHeightsLinked ? [["Room height", "roomHeight"]] : [["Standard room height", "roomHeights.standard"], ["Hallway height", "roomHeights.hallway"], ["Bathroom height", "roomHeights.bathroom"], ["Connection height", "roomHeights.connection"], ["Inaccessible height", "roomHeights.inaccessible"]]), ["Interior walls", "wallHeights.interior"], ["Exterior walls", "wallHeights.exterior"], ["Objects", "objectHeight"]].map(([label, path]) => <label className="indoor-number-field" key={path}>{label}<Input data-wd-key={(path === "roomHeight" || path === "roomHeights.standard") ? "indoor:geometry-height" : undefined} type="number" min="0" max="100" step="0.1" value={Number(at(props.theme, path))} onChange={event => { if (event.target.value !== "") update(path, Number(event.target.value)); }} /></label>)}<p className="indoor-hint">Heights are in meters.</p></AccordionContent></AccordionItem><AccordionItem value="document"><AccordionTrigger>Document details</AccordionTrigger><AccordionContent><label className="indoor-number-field">Name<Input aria-label="Theme name" value={props.theme.name} onChange={event => update("name", event.target.value)} /></label><p className="indoor-hint">Mappedin indoor theme JSON. Outdoor styles use a separate MapLibre format.</p><Button variant="ghost" onClick={() => setJson(true)}>Edit JSON</Button></AccordionContent></AccordionItem></Accordion>
  </div>;
  const modals = <><ModalOpen isOpen={open} onOpenToggle={() => setOpen(false)} onStyleOpen={props.onImportOutdoor} onIndoorOpen={props.onChange} fileHandle={null}/><Modal isOpen={json} title="Theme JSON" onOpenToggle={() => setJson(false)} data-wd-key="indoor:json"><p>Edit the indoor theme. Invalid changes are kept here until corrected.</p><InputJson lintType="json" value={props.theme} onChange={value => { try { props.onChange(parseIndoorTheme(value)); setError(""); } catch (reason) { setError((reason as Error).message); } }} className="maputnik-code-editor" withScroll />{error && <p role="alert">{error}</p>}</Modal></>;
  return <div className="indoor-workspace" data-wd-key="indoor:workspace"><AppLayout compactList toolbar={toolbar} layerList={categories} layerEditor={inspector} map={<IndoorCanvas theme={props.theme}/>} modals={modals}/></div>;
}
