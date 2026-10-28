// Adapted from Toolcraft, Copyright (c) 2026 Pixel Point. MIT; see LICENSE.toolcraft.md.
// Source: starter/src/toolcraft/ui/components/primitives/select.tsx
// Local presentation replaces Tailwind; Base UI behavior and compound parts are retained.
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "./utils";
import { PrimitiveArrowIcon } from "./primitive-arrow-icon";

function Select<Value, Multiple extends boolean | undefined = false>(props: SelectPrimitive.Root.Props<Value, Multiple>) {
  return <SelectPrimitive.Root {...props} />;
}
function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn("tc-select-group", className)} {...props} />;
}
function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn("tc-select-value", className)} {...props} />;
}
function SelectTrigger({ className, size = "default", variant = "default", radius = "default", placeholderTone = "muted", children, ...props }: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "default" | "ghost";
  radius?: "default" | "full";
  placeholderTone?: "default" | "muted";
}) {
  return <SelectPrimitive.Trigger data-slot="select-trigger" data-size={size} data-variant={variant} data-radius={radius} data-placeholder-tone={placeholderTone} className={cn("tc-select-trigger", className)} {...props}>
    {children}
    <SelectPrimitive.Icon render={<PrimitiveArrowIcon />} />
  </SelectPrimitive.Trigger>;
}
function SelectContent({ className, children, align = "start", side = "bottom", sideOffset = 4, alignOffset = 0, ...props }: SelectPrimitive.Popup.Props & Pick<SelectPrimitive.Positioner.Props, "align" | "side" | "sideOffset" | "alignOffset">) {
  return <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner className="tc-positioner" align={align} side={side} sideOffset={sideOffset} alignOffset={alignOffset}>
      <SelectPrimitive.Popup data-slot="select-content" className={cn("tc-select-content", className)} {...props}>
        <SelectPrimitive.List>{children}</SelectPrimitive.List>
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>;
}
function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return <SelectPrimitive.Item data-slot="select-item" className={cn("tc-select-item", className)} {...props}>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="tc-select-indicator"><CheckIcon aria-hidden="true" /></SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>;
}
function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return <SelectPrimitive.GroupLabel data-slot="select-label" className={cn("tc-dropdown-label", className)} {...props} />;
}
function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("tc-dropdown-separator", className)} {...props} />;
}
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectLabel, SelectSeparator };
