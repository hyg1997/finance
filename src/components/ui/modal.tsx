import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { useIsMobile } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

const Modal = DialogPrimitive.Root;

const ModalTrigger = DialogPrimitive.Trigger;

const ModalPortal = DialogPrimitive.Portal;

const ModalClose = DialogPrimitive.Close;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-modal bg-background shadow-lg duration-200 data-[state=open]:animate-scale-in data-[state=closed]:animate-fade-out",
          isMobile && [
            "inset-x-0 bottom-0 rounded-t-xl border-t",
            "data-[state=open]:slide-in-from-bottom-full",
            "data-[state=closed]:slide-out-to-bottom-full",
            "max-h-[90vh] overflow-y-auto",
            "mx-2 mb-2 rounded-b-xl shadow-2xl",
          ],
          !isMobile && [
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border",
            "w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto",
            "data-[state=open]:slide-in-from-top-[48%]",
            "data-[state=closed]:slide-out-to-top-[48%]",
            "shadow-2xl",
          ],
          !isMobile && [
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border",
            "w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto",
            "data-[state=open]:slide-in-from-top-[48%]",
            "data-[state=closed]:slide-out-to-top-[48%]",
            "shadow-2xl",
          ],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <ModalClose className="absolute right-4 top-4 rounded-full p-1.5 opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 hover:bg-accent hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </ModalClose>
        )}
      </DialogPrimitive.Content>
    </ModalPortal>
  );
});
ModalContent.displayName = DialogPrimitive.Content.displayName;

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-4",
      className
    )}
    {...props}
  />
);
ModalHeader.displayName = "ModalHeader";

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4",
      className
    )}
    {...props}
  />
);
ModalFooter.displayName = "ModalFooter";

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
};
