import {
  Root,
  Trigger,
  Portal,
  Close,
  Overlay,
  Content,
  Title,
  Description,
} from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  forwardRef,
  ComponentRef,
  ComponentPropsWithoutRef,
  HTMLAttributes,
} from "react";

import { useIsMobile } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

const Modal = Root;

const ModalTrigger = Trigger;

const ModalPortal = Portal;

const ModalClose = Close;

const ModalOverlay = forwardRef<
  ComponentRef<typeof Overlay>,
  ComponentPropsWithoutRef<typeof Overlay>
>(({ className, ...props }, ref) => (
  <Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = Overlay.displayName;

const ModalContent = forwardRef<
  ComponentRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content> & {
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <ModalPortal>
      <ModalOverlay />
      <Content
        ref={ref}
        className={cn(
          "fixed z-modal bg-background shadow-lg duration-200 min-w-[320px] md:min-w-[720px] data-[state=open]:animate-scale-in data-[state=closed]:animate-fade-out",
          isMobile && [
            "inset-x-0 bottom-0 w-full rounded-t-xl border-t",
            "data-[state=open]:slide-in-from-bottom-full",
            "data-[state=closed]:slide-out-to-bottom-full",
            "max-h-[90vh] overflow-y-auto",
          ],
          !isMobile && [
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "w-full max-w-lg max-h-[85vh] overflow-y-auto",
          ],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <ModalClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </ModalClose>
        )}
      </Content>
    </ModalPortal>
  );
});
ModalContent.displayName = Content.displayName;

const ModalHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
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
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4",
      className
    )}
    {...props}
  />
);
ModalFooter.displayName = "ModalFooter";

const ModalTitle = forwardRef<
  ComponentRef<typeof Title>,
  ComponentPropsWithoutRef<typeof Title>
>(({ className, ...props }, ref) => (
  <Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = Title.displayName;

const ModalDescription = forwardRef<
  ComponentRef<typeof Description>,
  ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModalDescription.displayName = Description.displayName;

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
