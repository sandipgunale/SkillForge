import { useRef } from "react";
import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { COMPONENT, GLOW, TYPOGRAPHY } from "@/lib/design-system";
import { useMountAnimation } from "@/lib/motion-gsap";

import {
  passwordStrength,
  strengthSegments,
  STRENGTH_LABELS,
} from "../lib/passwordStrength";

const ICONS = {
  mail: Mail,
  lock: LockKeyhole,
  user: User,
};

const STRENGTH_COLORS = {
  1: "bg-foreground/25",
  2: "bg-warning",
  3: "bg-ember",
  4: "bg-success",
};

/* Entrance presets for the morphing adornments (single source in design tokens). */
const EYE_IN = { rotateX: 90, duration: 0.25, ease: "expo.out" };
const ICON_IN = { x: 8, scale: 0.6, duration: 0.3, ease: "back.out(1.7)" };
const LINE_IN = { scaleX: 0, duration: 0.35, ease: "expo.out" };
const HINT_IN = { y: -4, duration: 0.25, ease: "expo.out" };
const ERROR_IN = { height: 0, duration: 0.25, ease: "expo.out" };

/**
 * FloatingField — premium auth input.
 * Material-style floating label, animated leading icon, live validation
 * (green check slides in / red underline grows in), optional password
 * strength bar, Caps Lock detection, and a morphing visibility toggle.
 */
export default function FloatingField({
  id,
  label,
  icon,
  type = "text",
  autoComplete,
  field,
  error,
  valid = false,
  isPassword = false,
  showStrength = false,
}) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [value, setValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const floated = focused || hasValue;
  const Icon = ICONS[icon] ?? User;
  const score = passwordStrength(value);
  const segments = strengthSegments(score);

  const inputType = isPassword && !showPassword ? "password" : type;

  const trailingKey = isPassword
    ? "eye"
    : error && hasValue
      ? "alert"
      : valid
        ? "check"
        : "empty";

  const handleKeyState = (e) => {
    if (e.getModifierState) setCapsLock(e.getModifierState("CapsLock"));
  };

  return (
    <div>
      <div
        className={cn(
          "group relative border transition-all duration-300",
          COMPONENT.field.size,
          COMPONENT.field.radius,
          COMPONENT.field.idle,
          focused && !error && COMPONENT.field.focus,
          focused && error && COMPONENT.field.focusError,
          !focused && error && COMPONENT.field.error,
          !focused && !error && COMPONENT.field.hover,
        )}
        style={{
          boxShadow: focused
            ? error
              ? GLOW.focusDestructive
              : GLOW.focusEmber
            : undefined,
        }}
      >
        {/* Leading icon — glows and lifts on focus */}
        <div
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300",
            focused && !error && "scale-110 text-ember",
            focused && error && "text-destructive",
            hasValue && !focused && "text-foreground/70",
          )}
          style={focused && !error ? { filter: `drop-shadow(${GLOW.icon()})` } : undefined}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>

        {/* Floating label */}
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-12 origin-left transition-all duration-300",
            floated
              ? cn(TYPOGRAPHY.label, "top-2.5 text-foreground/60")
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
            focused && !error && floated && "text-ember",
          )}
        >
          {label}
        </label>

        <input
          id={id}
          ref={(node) => {
            field.ref?.(node);
          }}
          name={field.name}
          type={inputType}
          autoComplete={autoComplete}
          onChange={(e) => {
            setValue(e.target.value);
            setHasValue(e.target.value.length > 0);
            field.onChange(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            field.onBlur?.(e);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyState}
          onKeyUp={handleKeyState}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-full w-full bg-transparent pl-12 pr-12 text-[15px] font-medium text-foreground outline-none placeholder:text-transparent"
        />

        {/* Trailing: validation check / visibility toggle */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          <Adornment key={trailingKey} kind={trailingKey} showPassword={showPassword} onToggle={() => setShowPassword((v) => !v)} />
        </div>

{/* Error underline — grows on, no shaking */}
        {error && (
          <GrowLine>
            <span className="absolute inset-x-2 -bottom-px h-px bg-destructive" />
          </GrowLine>
        )}
      </div>

      {/* Caps Lock hint */}
      {isPassword && focused && capsLock && (
        <AdornIn className="mt-2" preset={HINT_IN}>
          <div className={cn("flex items-center gap-1.5", TYPOGRAPHY.hint, "text-warning")}>
            <AlertTriangle className="size-3.5" />
            Caps Lock is on
          </div>
        </AdornIn>
      )}

      {/* Password strength bar */}
      {showStrength && hasValue && (
        <div className={cn("mt-2 flex items-center gap-2", TYPOGRAPHY.hint)}>
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  level <= segments ? STRENGTH_COLORS[segments] : "bg-foreground/10",
                )}
              />
            ))}
          </div>
          <span className="text-muted-foreground">{STRENGTH_LABELS[segments]}</span>
        </div>
      )}

      {/* Error message */}
      {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Morphing adornment pieces — each mounts with its entrance tween.        */
/* ---------------------------------------------------------------------- */

function Adornment({ kind, showPassword, onToggle }) {
  if (kind === "eye") {
    return (
      <AdornIn preset={EYE_IN}>
        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </AdornIn>
    );
  }

  if (kind === "alert") {
    return (
      <AdornIn preset={ICON_IN} className="flex size-6 items-center justify-center text-destructive">
        <AlertCircle className="size-4" strokeWidth={2.25} />
      </AdornIn>
    );
  }

  if (kind === "check") {
    return (
      <AdornIn preset={ICON_IN} className="flex size-6 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="size-3.5" strokeWidth={3} />
      </AdornIn>
    );
  }

  return <span className="block size-6" />;
}

/** Motion wrapper — runs `preset` (+ opacity) as a mount/replay entrance. */
function AdornIn({ children, className, style, preset }) {
  const ref = useRef(null);
  useMountAnimation(ref, [], { ...preset });

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/** Error underline — grows from the left origin. */
function GrowLine({ children }) {
  const ref = useRef(null);
  useMountAnimation(ref, [], { ...LINE_IN });

  return (
    <div ref={ref} className="origin-left">
      {children}
    </div>
  );
}

/** Error message — collapses open from zero height. */
function ErrorText({ id, children }) {
  const ref = useRef(null);
  useMountAnimation(ref, [], { ...ERROR_IN });

  return (
    <p ref={ref} id={id} className={cn(TYPOGRAPHY.fieldError, "overflow-hidden")}>
      <span className="inline-block py-1.5">{children}</span>
    </p>
  );
}