"use client"

import * as React from "react"
import * as DialogGamePrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

const DialogGame = DialogGamePrimitive.Root

const DialogGameTrigger = DialogGamePrimitive.Trigger

const DialogGamePortal = DialogGamePrimitive.Portal

const DialogGameClose = DialogGamePrimitive.Close

const DialogGameOverlay = React.forwardRef<
  React.ElementRef<typeof DialogGamePrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogGamePrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogGamePrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogGameOverlay.displayName = DialogGamePrimitive.Overlay.displayName

const DialogGameContent = React.forwardRef<
  React.ElementRef<typeof DialogGamePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogGamePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogGamePortal>
    <DialogGameOverlay />
    <DialogGamePrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      onPointerDownOutside={(e) => e.preventDefault()}
      {...props}
    >
      {children}
    </DialogGamePrimitive.Content>
  </DialogGamePortal>
))
DialogGameContent.displayName = DialogGamePrimitive.Content.displayName

const DialogGameHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogGameHeader.displayName = "DialogGameHeader"

const DialogGameFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogGameFooter.displayName = "DialogGameFooter"

const DialogGameTitle = React.forwardRef<
  React.ElementRef<typeof DialogGamePrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogGamePrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogGamePrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogGameTitle.displayName = DialogGamePrimitive.Title.displayName

const DialogGameDescription = React.forwardRef<
  React.ElementRef<typeof DialogGamePrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogGamePrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogGamePrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogGameDescription.displayName = DialogGamePrimitive.Description.displayName

export {
  DialogGame,
  DialogGamePortal,
  DialogGameOverlay,
  DialogGameTrigger,
  DialogGameClose,
  DialogGameContent,
  DialogGameHeader,
  DialogGameFooter,
  DialogGameTitle,
  DialogGameDescription,
}
