import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { profileSchema, defaultProfileValues } from "../schemas/profile.schema";

import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileForm() {
  const { data: user, isLoading } = useProfile();

  const updateMutation = useUpdateProfile();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileValues,
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName ?? "",
        email: user.email ?? "",
        avatarUrl: user.avatarUrl ?? "",
        skillLevel: user.skillLevel ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    updateMutation.mutate({
      fullName: data.fullName,
      avatarUrl: data.avatarUrl,
      skillLevel: data.skillLevel,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-20">Loading profile...</div>;
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold">My Profile</h2>

          <p className="text-muted-foreground">
            Manage your account information.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Full Name</Label>

            <Input {...register("fullName")} />

            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>

            <Input disabled {...register("email")} />

            <p className="text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Avatar URL</Label>

            <Input
              placeholder="https://example.com/avatar.png"
              {...register("avatarUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label>Skill Level</Label>

            <select
              {...register("skillLevel")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Skill Level</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Updating..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
