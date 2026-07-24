import { useState } from "react";
import { Link } from "react-router-dom";

import { Eye, EyeOff, BookOpen } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  defaultRegisterValues,
} from "../schemas/register.schema";

import { useRegister } from "../hooks/useRegister";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultRegisterValues,
  });

  const registerMutation = useRegister();

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <Card className="w-full border shadow-xl">
      <CardContent className="space-y-8 p-8">
        {/* Logo */}

        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen size={28} />
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold">Create Account</h1>

            <p className="mt-2 text-muted-foreground">
              Start your SkillForge journey
            </p>
          </div>
        </div>

        {/* Form */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>

            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              {...register("fullName")}
            />

            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
            />

            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Register Button */}

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? "Creating Account..."
              : "Create Account"}
          </Button>
        </form>

        {/* Footer */}

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
