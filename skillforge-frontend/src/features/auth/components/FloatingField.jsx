import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { EASE_OUT_EXPO, SPRING_TACTILE } from "@/lib/motion";

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

/**
 * FloatingField — premium auth input.
 * Material-style floating label, animated leading icon, live validation
 * (green check slides in / red underline on error), optional password
 * strength bar, Caps Lock detection, and a morphing visibility toggle.
 */
export default function FloatingField({
  id,
  label,
  icon,
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

  const inputType = isPassword && !showPassword ? "password" : "text";

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
          <AnimatePresence mode="wait" initial={false}>
            {isPassword ? (
              <motion.button
                key="eye"
                type="button"
                initial={{ opacity: 0, rotateX: 90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: -90 }}
                transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
              </motion.button>
            ) : error && hasValue ? (
              <motion.span
                key="alert"
                initial={{ opacity: 0, x: 8, scale: 0.6 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={SPRING_TACTILE}
                className="flex size-6 items-center justify-center text-destructive"
              >
                <AlertCircle className="size-4" strokeWidth={2.25} />
              </motion.span>
            ) : valid ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, x: 8, scale: 0.6 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={SPRING_TACTILE}
                className="flex size-6 items-center justify-center rounded-full bg-success/15 text-success"
              >
                <Check className="size-3.5" strokeWidth={3} />
              </motion.span>
            ) : (
              <span key="slot" className="size-6" />
            )}
          </AnimatePresence>
        </div>

        {/* Error underline — grows in, professional, no shaking */}
        <AnimatePresence>
          {error && (
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              className="absolute inset-x-2 -bottom-px h-px origin-left bg-destructive"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Caps Lock warning — only while a password field is focused */}
      <AnimatePresence>
        {isPassword && focused && capsLock && (
          <motion.div
            key="caps"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            className={cn("mt-2 flex items-center gap-1.5", TYPOGRAPHY.hint, "text-warning")}
          >
            <AlertTriangle className="size-3.5" />
            Caps Lock is on
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password strength bar */}
      {showStrength && hasValue && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          className={cn("mt-2 flex items-center gap-2", TYPOGRAPHY.hint)}
        >
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  level <= segments
                    ? STRENGTH_COLORS[segments]
                    : "bg-foreground/10",
                )}
              />
            ))}
          </div>
          <span className="text-muted-foreground">
            {STRENGTH_LABELS[segments]}
          </span>
        </motion.div>
      )}

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            className={cn(TYPOGRAPHY.fieldError, "overflow-hidden")}
          >
            <span className="inline-block py-1.5">{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
