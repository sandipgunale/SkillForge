import { useRef } from "react";
import { Link } from "react-router-dom";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, defaultLoginValues } from "../schemas/login.schema";

import { useLogin } from "../hooks/useLogin";

import AuthCard from "./AuthCard";
import AuthLogo from "./AuthLogo";
import FloatingField from "./FloatingField";
import AuthSubmitButton from "./AuthSubmitButton";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { useReveal } from "@/lib/motion-gsap";
import { TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

import { ROUTES } from "@/constants/routes";

export default function LoginForm() {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
  });

  const loginMutation = useLogin();

  const email = watch("email");
  const password = watch("password");

  const status = loginMutation.isPending
    ? "loading"
    : loginMutation.isSuccess
      ? "success"
      : "idle";

  const headerRef = useRef(null);
  useReveal(headerRef, { stagger: 0.08, y: 22 });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
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
            <h1 className={TYPOGRAPHY.display}>Welcome back</h1>

            <p className={cn("mt-2", TYPOGRAPHY.subtitle)}>
              Pick up where you left off — your momentum is waiting.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            autoComplete="current-password"
            field={register("password")}
            error={errors.password?.message}
            valid={!errors.password && password?.length > 0}
          />

          {/* Remember me / forgot */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />

              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium text-muted-foreground"
              >
                Remember me
              </Label>
            </div>

            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className={cn(TYPOGRAPHY.link, "text-sm font-semibold")}
            >
              Forgot Password?
            </Link>
          </div>

          <AuthSubmitButton
            status={status}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in" : "Sign In"}
          </AuthSubmitButton>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to={ROUTES.REGISTER}
            className={cn(TYPOGRAPHY.link, "font-bold")}
          >
            Create Account
          </Link>
        </div>

        {/* Demo access */}
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-aurora">
            Demo access
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>
              <span className="font-mono text-foreground">admin@skillforge.com</span>
              {" — "}seeded at startup; password comes from{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.7rem]">
                ADMIN_PASSWORD
              </code>{" "}
              in the backend&apos;s{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.7rem]">
                .env
              </code>
            </li>
            <li>
              Instructor accounts: pick{" "}
              <span className="font-semibold text-foreground">Instructor</span>{" "}
              when registering — no admin needed.
            </li>
          </ul>
        </div>
      </div>
    </AuthCard>
  );
}
