import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, ShieldAlert } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  resetPasswordSchema,
  defaultResetPasswordValues,
} from "../schemas/passwordReset.schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "../hooks/useResetPassword";
import { ROUTES } from "@/constants/routes";
import { COMPONENT, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: defaultResetPasswordValues,
  });

  const resetMutation = useResetPassword();

  if (!token) {
    return (
      <Card className="glass w-full border shadow-2xl">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center sm:p-10">
          <div className={cn("flex items-center justify-center bg-destructive/15 text-destructive", COMPONENT.iconTile.size, COMPONENT.iconTile.radius)}>
            <ShieldAlert size={28} />
          </div>
          <h1 className={TYPOGRAPHY.title}>Link missing</h1>
          <p className="text-sm text-muted-foreground">
            This reset link is incomplete. Request a fresh one and open it in
            full.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link to={ROUTES.FORGOT_PASSWORD}>Request a new link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass w-full border shadow-2xl">
      <CardContent className="space-y-8 p-8 sm:p-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={cn("flex items-center justify-center bg-primary text-primary-foreground", COMPONENT.iconTile.size, COMPONENT.iconTile.radius)}>
            <CheckCircle2 size={28} />
          </div>

          <div>
            <h1 className={TYPOGRAPHY.title}>Choose a new password</h1>

            <p className={cn("mt-2", TYPOGRAPHY.subtitle)}>
              Make it strong — you&apos;ll use it to sign in from now on.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit((data) =>
            resetMutation.mutate({ token, newPassword: data.newPassword })
          )}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>

            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={!!errors.newPassword}
                aria-describedby={
                  errors.newPassword ? "new-password-error" : undefined
                }
                {...register("newPassword")}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.newPassword && (
              <p id="new-password-error" className={TYPOGRAPHY.fieldError}>
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>

            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
              {...register("confirmPassword")}
            />

            {errors.confirmPassword && (
              <p id="confirm-password-error" className={TYPOGRAPHY.fieldError}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? "Updating..." : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
