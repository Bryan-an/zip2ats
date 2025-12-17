import * as React from "react";
import { IMaskInput } from "react-imask";

import { cn } from "@/lib/utils";

type MaskedInputProps = React.ComponentProps<typeof IMaskInput> & {
  className?: string;
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  // React's object refs are `RefObject<T>` (MutableRefObject is deprecated in React 19 types)
  (ref as React.RefObject<T | null>).current = value;
}

const baseInputClassName =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

const focusInputClassName =
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const invalidInputClassName =
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, inputRef, ...props }, forwardedRef) => {
    const setRefs = (el: HTMLInputElement | null) => {
      assignRef(inputRef, el);
      assignRef(forwardedRef, el);
    };

    return (
      <IMaskInput
        data-slot="input"
        className={cn(
          baseInputClassName,
          focusInputClassName,
          invalidInputClassName,
          className
        )}
        inputRef={setRefs}
        {...props}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";
