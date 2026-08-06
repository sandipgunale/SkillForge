import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  defaultRegisterValues,
} from "../schemas/register.schema";

import { useRegister } from "../hooks/useRegister";

import AuthCard from "./AuthCard";
import AuthLogo from "./AuthLogo";
import FloatingField from "./FloatingField";
import AuthSubmitButton from "./AuthSubmitButton";

import { staggerList, staggerListItem } from "@/lib/motion";
import { TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

import { ROUTES } from "@/constants/routes";

export default function RegisterForm() {
  const {
    register,
    watch,
    handleSubmit,
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

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <AuthCard>
      <div className="space-y-8 p-8 sm:p-10">
        {/* Header — breathing mark + editorial type */}
        <motion.div
          variants={staggerList(0.08)}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-4 text-center"
        >
          <motion.div variants={staggerListItem}>
            <AuthLogo size="lg" showWordmark={false} />
          </motion.div>

          <motion.div variants={staggerListItem}>
            <h1 className={TYPOGRAPHY.display}>Create account</h1>

            <p className={cn("mt-2", TYPOGRAPHY.subtitle)}>
              Start your forge — focus, practice, and build momentum.
            </p>
          </motion.div>
        </motion.div>

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