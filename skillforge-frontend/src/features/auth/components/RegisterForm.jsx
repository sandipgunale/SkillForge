import { useRef } from "react";
import { Link } from "react-router-dom";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  defaultRegisterValues,
  ROLE_OPTIONS,
} from "../schemas/register.schema";

import { useRegister } from "../hooks/useRegister";

import AuthCard from "./AuthCard";
import AuthLogo from "./AuthLogo";
import FloatingField from "./FloatingField";
import AuthSubmitButton from "./AuthSubmitButton";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { useReveal } from "@/lib/motion-gsap";
import { TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

import { ROUTES } from "@/constants/routes";

export default function RegisterForm() {
  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultRegisterValues,
  });

  const registerMutation = useRegister();

  const fullName = watch("fullName");
  const email = watch("email");

  const status = registerMutation.isPending
    ? "loading"
    : registerMutation.isSuccess
      ? "success"
      : "idle";

  const headerRef = useRef(null);
  useReveal(headerRef, { stagger: 0.08, y: 22 });

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <AuthCard>
      <div className="space-y-8 p-8 sm:p-10">
        {/* Header — breathing mark + editorial type */}
        <div
          ref={headerRef}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div>
            <AuthLogo size="lg" showWordmark={false} />
          </div>

          <div>
            <h1 className={TYPOGRAPHY.display}>Create account</h1>

            <p className={cn("mt-2", TYPOGRAPHY.subtitle)}>
              Start your forge — focus, practice, and build momentum.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FloatingField
            id="fullName"
            label="Full Name"
            icon="user"
            type="text"
            autoComplete="name"
            field={register("fullName")}
            error={errors.fullName?.message}
            valid={!errors.fullName && fullName?.length > 1}
          />

          <FloatingField
            id="email"
            label="Email"
            icon="mail"
            type="email"
            autoComplete="email"
            field={register("email")}
            error={errors.email?.message}
            valid={!errors.email && email?.length > 0}
          />

          <FloatingField
            id="password"
            label="Password"
            icon="lock"
            isPassword
            showStrength
            autoComplete="new-password"
            field={register("password")}
            error={errors.password?.message}
          />

          {/* Role */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="role" className="text-sm font-medium">
                I am joining as
              </Label>
              {errors.role && (
                <span className="text-xs font-medium text-destructive">
                  {errors.role.message}
                </span>
              )}
            </div>

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  id="role"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-2 gap-3"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`role-${option.value.toLowerCase()}`}
                      className={cn(
                        "flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors",
                        field.value === option.value
                          ? "border-ember bg-ember/5"
                          : "border-border hover:border-ember/40",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <RadioGroupItem
                          value={option.value}
                          id={`role-${option.value.toLowerCase()}`}
                          checked={field.value === option.value}
                        />
                        <span className="text-sm font-semibold">
                          {option.label}
                        </span>
                      </div>
                      <span className="pl-6 text-xs leading-snug text-muted-foreground">
                        {option.description}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          <AuthSubmitButton
            status={status}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? "Creating account"
              : "Create Account"}
          </AuthSubmitButton>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            className={cn(TYPOGRAPHY.link, "font-bold")}
          >
            Sign In
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}