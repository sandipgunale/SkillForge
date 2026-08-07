import { useCallback, useRef } from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import {
  GSAP_EASE,
  useReducedMotion,
} from "@/lib/motion-gsap";

function Checkbox({ className, ...props }) {
  const reduced = useReducedMotion();
  const animatedRef = useRef(new Set());

  const checkRef = useCallback(
    (node) => {
      if (!node || reduced || animatedRef.current.has(node)) return;
      animatedRef.current.add(node);
      gsap.from(node, {
        scale: 0,
        opacity: 0,
        rotate: -30,
        duration: 0.3,
        ease: GSAP_EASE.spring,
        clearProps: "opacity,transform",
      });
    },
    [reduced],
  );

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current"
      >
        <span ref={checkRef} className="[&>svg]:size-3.5">
          <CheckIcon />
        </span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };