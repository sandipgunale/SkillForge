import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  forgotPasswordSchema,
  defaultForgotPasswordValues,
} from "../schemas/passwordReset.schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { ROUTES } from "@/constants/routes";
import { COMPONENT, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: defaultForgotPasswordValues,
  });

  const forgotMutation = useForgotPassword();

  return (
    <Card className="glass w-full border shadow-2xl">
      <CardContent className="space-y-8 p-8 sm:p-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={cn("flex items-center justify-center bg-primary text-primary-foreground", COMPONENT.iconTile.size, COMPONENT.iconTile.radius)}>
            <KeyRound size={28} />
          </div>

          <div>
            <h1 className={TYPOGRAPHY.title}>Reset your password</h1>

            <p className={cn("mt-2", TYPOGRAPHY.subtitle)}>
              Enter your account email and we&apos;ll send you a secure reset
              link.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => forgotMutation.mutate(data))} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />

            {errors.email && (
              <p id="email-error" className={TYPOGRAPHY.fieldError}>
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={forgotMutation.isPending}
          >
            {forgotMutation.isPending ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        {forgotMutation.isSuccess && (
          <div
            role="status"
            className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success"
          >
            If that email is registered, a reset link is on its way. Check your
            inbox (and spam folder).
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
