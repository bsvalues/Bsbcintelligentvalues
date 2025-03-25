import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { useToastState, useDismissToast } from "./use-toast";

export function Toaster() {
  const toasts = useToastState();
  const dismissToast = useDismissToast();

  return React.createElement(
    ToastProvider,
    null,
    toasts.map(({ id, title, description, action, ...props }) => 
      React.createElement(
        Toast,
        {
          key: id,
          ...props,
          onOpenChange: (open: boolean) => !open && dismissToast(id)
        },
        React.createElement(
          "div",
          { className: "grid gap-1" },
          title && React.createElement(ToastTitle, null, title),
          description && React.createElement(ToastDescription, null, description)
        ),
        action,
        React.createElement(ToastClose, null)
      )
    ),
    React.createElement(ToastViewport, null)
  );
}