"use client";

import * as React from "react";
import * as DrawerPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";


// Drawer Root
const Drawer = DrawerPrimitive.Root;

// Drawer Trigger (optional)
const DrawerTrigger = DrawerPrimitive.Trigger;

// Drawer Portal
const DrawerPortal = DrawerPrimitive.Portal;

// Overlay for Drawer
const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-40 bg-black/50 transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out",
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

// Drawer Content
const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & { open?: boolean }
>(({ className, children, open, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <AnimatePresence>
      {open && (
        <DrawerPrimitive.Content
          ref={ref}
          asChild
          forceMount
          {...props}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 38 }}
            className={cn(
              "fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-xl flex flex-col",
              className
            )}
          >
            {children}
          </motion.div>
        </DrawerPrimitive.Content>
      )}
    </AnimatePresence>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";


// Drawer Header
const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 pt-6 pb-2", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

// Drawer Title
const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

// Drawer Close
const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Close
    ref={ref}
    className={cn(
      "absolute rounded-md p-2 transition-colors hover:bg-gray-100 focus:outline-none ",
      className
    )}
    {...props}
  />
));
DrawerClose.displayName = "DrawerClose";

// Export all Drawer components
export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
};
