import React from "react";
import { FieldFunction } from "./FieldFunction";
import type { LayerSpecification } from "maplibre-gl";
import { type MappedLayerErrors } from "../libs/definitions";
import { Button } from "./toolcraft";

const iconProperties = ["background-pattern", "fill-pattern", "line-pattern", "fill-extrusion-pattern", "icon-image"];
const commonProperties = new Set([
  "background-color", "background-opacity", "fill-color", "fill-opacity", "fill-outline-color",
  "line-color", "line-width", "line-opacity", "line-dasharray",
  "circle-color", "circle-radius", "circle-opacity", "circle-stroke-color", "circle-stroke-width",
  "fill-extrusion-color", "fill-extrusion-height", "fill-extrusion-base", "fill-extrusion-opacity",
  "text-field", "text-font", "text-size", "text-color", "text-opacity", "text-halo-color", "text-halo-width",
  "icon-image", "icon-size", "icon-color", "icon-opacity", "symbol-placement",
  "raster-opacity", "raster-contrast", "hillshade-exaggeration", "hillshade-shadow-color", "hillshade-highlight-color"
]);

function getGroupName(spec: any, layerType: LayerSpecification["type"], fieldName: string): "paint" | "layout" {
  return fieldName in (spec["paint_" + layerType] || {}) ? "paint" : "layout";
}
function getFieldSpec(spec: any, layerType: LayerSpecification["type"], fieldName: string) {
  const fieldSpec = spec[getGroupName(spec, layerType, fieldName) + "_" + layerType][fieldName];
  if (iconProperties.includes(fieldName)) return { ...fieldSpec, values: spec.$root.sprite.values };
  if (fieldName === "text-font") return { ...fieldSpec, values: spec.$root.glyphs.values };
  return fieldSpec;
}

type PropertyGroupProps = {
  layer: LayerSpecification
  groupFields: string[]
  onChange(...args: unknown[]): unknown
  spec: any
  errors?: MappedLayerErrors
};

export class PropertyGroup extends React.Component<PropertyGroupProps, { showAll: boolean }> {
  state = { showAll: false };
  onPropertyChange = (property: string, newValue: any) => this.props.onChange(getGroupName(this.props.spec, this.props.layer.type, property), property, newValue);

  render() {
    const { layer, groupFields, spec, errors } = this.props;
    const paint = layer.paint || {};
    const layout = layer.layout || {};
    const isEssential = (name: string) => commonProperties.has(name) || name in paint || name in layout || !!errors?.[name];
    const secondaryCount = groupFields.filter(name => !isEssential(name)).length;
    const fields = groupFields.filter(name => this.state.showAll || isEssential(name)).map(fieldName => {
      const value = fieldName in paint ? paint[fieldName as keyof typeof paint] : layout[fieldName as keyof typeof layout];
      return <FieldFunction
        errors={errors}
        onChange={this.onPropertyChange}
        key={fieldName}
        fieldName={fieldName}
        value={value}
        fieldType={fieldName in paint ? "paint" : "layout"}
        fieldSpec={getFieldSpec(spec, layer.type, fieldName)}
      />;
    });
    return <div className="maputnik-property-group">
      {fields}
      {secondaryCount > 0 && <Button
        variant="ghost"
        size="sm"
        className="workspace-more-properties"
        aria-expanded={this.state.showAll}
        data-wd-key={`advanced-properties:${layer.type}:${groupFields[0]}`}
        onClick={() => this.setState(({ showAll }) => ({ showAll: !showAll }))}
      >{this.state.showAll ? "Fewer properties" : `More properties (${secondaryCount})`}</Button>}
    </div>;
  }
}
