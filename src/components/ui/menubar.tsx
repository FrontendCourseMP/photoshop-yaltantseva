import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

const MENU_BG = "bg-[hsl(220,10%,26%)]"
const ITEM_BASE = "relative flex cursor-default items-center gap-2.5 rounded-none px-3 py-2 text-sm font-medium text-white outline-hidden select-none focus:bg-white/10 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function Menubar({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn("flex h-9 items-center", MENU_BG, className)}
      {...props}
    />
  )
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "flex items-center rounded-none px-3 py-1 text-sm font-medium text-white outline-hidden select-none hover:bg-white/10 aria-expanded:bg-white/10",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-48 overflow-hidden rounded-none p-1.5 text-white shadow-lg border border-white/20 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          MENU_BG, className
        )}
        {...props}
      />
    </MenubarPortal>
  )
}

function MenubarItem({ className, inset, variant = "default", ...props }: React.ComponentProps<typeof MenubarPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(ITEM_BASE, "data-inset:pl-9", className)}
      {...props}
    />
  )
}

function MenubarCheckboxItem({ className, children, checked, inset, ...props }: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={cn(ITEM_BASE, "pl-9", className)}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-3 flex size-4 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioItem({ className, children, inset, ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioItem> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(ITEM_BASE, "pl-9", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-3 flex size-4 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({ className, inset, ...props }: React.ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn("px-3 py-2 text-xs text-white/50 data-inset:pl-9", className)}
      {...props}
    />
  )
}

function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-white/20", className)}
      {...props}
    />
  )
}

function MenubarShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn("ml-auto text-xs tracking-widest text-white/50", className)}
      {...props}
    />
  )
}

function MenubarSub({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-white outline-none select-none focus:bg-white/10 data-inset:pl-9 data-open:bg-white/10 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "z-50 min-w-32 overflow-hidden rounded-none p-1.5 text-white shadow-lg border border-white/20 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        MENU_BG, className
      )}
      {...props}
    />
  )
}

export {
  Menubar, MenubarPortal, MenubarMenu, MenubarTrigger, MenubarContent,
  MenubarGroup, MenubarSeparator, MenubarLabel, MenubarItem, MenubarShortcut,
  MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem,
  MenubarSub, MenubarSubTrigger, MenubarSubContent,
}