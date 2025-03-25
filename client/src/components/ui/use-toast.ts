// Adapted from shadcn/ui toast component
import * as React from "react";

import type {
  ToastActionElement,
  ToastProps,
} from "./toast";

const TOAST_LIMIT = 10;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateId() {
  return `${count++}`;
}

// Toast reducer to manage the toast state
type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

// Initial state
const initialState: State = {
  toasts: [],
};

// Toast dispatch context
const ToastDispatchContext = React.createContext<React.Dispatch<Action> | null>(
  null
);

// Toast state context
const ToastStateContext = React.createContext<State>(initialState);

function toastReducer(state: State, action: Action): State {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // If no toast ID provided, dismiss all
      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        };
      }

      // Dismiss specific toast by ID
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        ),
      };
    }

    case actionTypes.REMOVE_TOAST: {
      const { toastId } = action;

      // If no toast ID provided, remove all closed toasts
      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.open),
        };
      }

      // Remove specific toast by ID
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      };
    }
  }
}

// ToastProvider component
export const ToastProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = React.useReducer(toastReducer, initialState);

  return (
    React.createElement(ToastStateContext.Provider, { value: state },
      React.createElement(ToastDispatchContext.Provider, { value: dispatch },
        children
      )
    )
  );
}

export function useToast() {
  const dispatch = React.useContext(ToastDispatchContext);

  if (!dispatch) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const toastFunction = React.useMemo(() => {
    const toast = ({
      title,
      description,
      variant,
      action,
      ...props
    }: Omit<ToasterToast, "id">) => {
      const id = generateId();

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          id,
          title,
          description,
          variant,
          action,
          open: true,
          ...props,
        },
      });

      return {
        id,
        dismiss: () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id }),
        update: (props: Partial<ToasterToast>) =>
          dispatch({
            type: actionTypes.UPDATE_TOAST,
            toast: { ...props, id },
          }),
      };
    };

    // Helper to dismiss all toasts
    toast.dismiss = (toastId?: string) => {
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
    };

    return toast;
  }, [dispatch]);
  
  // Set the global toast function so it can be used outside of React components
  React.useEffect(() => {
    setToastFunction(toastFunction);
  }, [toastFunction]);

  return toastFunction;
}

export function useToastState() {
  const state = React.useContext(ToastStateContext);

  if (!state) {
    throw new Error("useToastState must be used within a ToastProvider");
  }

  return state.toasts;
}

// Helper hook to dismiss a toast after a delay
export function useDismissToast() {
  const dispatch = React.useContext(ToastDispatchContext);

  if (!dispatch) {
    throw new Error("useDismissToast must be used within a ToastProvider");
  }

  const dismissToast = React.useCallback(
    (toastId: string) => {
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId });

      // Remove the toast after a delay
      setTimeout(() => {
        dispatch({ type: actionTypes.REMOVE_TOAST, toastId });
      }, TOAST_REMOVE_DELAY);
    },
    [dispatch]
  );

  return dismissToast;
}

// Basic toast components to export for use by others
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

// Create a function that can be used outside of React components
let toastFn: (options: ToastOptions) => { id: string; dismiss: () => void; update: (props: Partial<ToasterToast>) => void; };

// Export a simplified toast function that can be used anywhere
export const toast = (options: ToastOptions) => {
  if (!toastFn) {
    console.warn("Toast was called before it was initialized by a React component");
    // Return a dummy toast object to prevent errors
    return {
      id: "",
      dismiss: () => {},
      update: () => {},
    };
  }
  return toastFn(options);
};

// This function is used to initialize the toast function
export function setToastFunction(fn: typeof toastFn) {
  toastFn = fn;
}