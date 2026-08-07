import { useEffect } from "react";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { profileSchema, defaultProfileValues } from "../schemas/profile.schema";

import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorState from "@/components/common/ErrorState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfileForm() {
  const { data: user, isLoading, isError, error, refetch } = useProfile();

  const updateMutation = useUpdateProfile();

  const {
    register,
    control,
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
    return (
      <Card className="shadow-lg">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/3" />

          <Skeleton className="h-4 w-2/3" />

          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <ErrorState
            title="Couldn't load your profile"
            description="Your profile data is safe — the request just didn't go through."
            onRetry={() => refetch()}
            diagnostic={String(error?.message ?? "network")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="space-y-6 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Full Name</Label>

            <Input {...register("fullName")} />

            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
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

            <Controller
              name="skillLevel"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || null}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Skill Level" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>

                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>

                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
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
