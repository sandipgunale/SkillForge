import { useState } from "react";

import ErrorState from "@/components/common/ErrorState";
import DashboardSkeleton from "@/features/dashboard/skeletons/DashboardSkeleton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ResourcePagination from "@/features/resources/components/ResourcePagination";

import { useAdminUsers } from "../hooks/useAdminData";
import { useUpdateUser } from "../hooks/useUpdateUser";

const PAGE_SIZE = 20;

const ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN"];

export default function UsersPanel() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useAdminUsers({
    search: search || undefined,
    page,
    size: PAGE_SIZE,
  });

  if (isError) {
    return (
      <ErrorState
        title="Failed to load users"
        description="Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <section className="space-y-4">
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        placeholder="Search by name or email…"
        aria-label="Search users"
        className="max-w-md"
      />

      {isLoading && !data ? (
        <DashboardSkeleton />
      ) : (data?.content?.length ?? 0) === 0 ? (
        <p className="text-muted-foreground">No users found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data?.content ?? []).map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      <ResourcePagination
        page={data?.page ?? 0}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        pageSize={PAGE_SIZE}
        label="users"
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </section>
  );
}

function UserCard({ user }) {
  const updateUser = useUpdateUser();

  const setRole = (role) =>
    updateUser.mutate({
      userId: user.id,
      payload: { role },
    });

  const toggleActive = () =>
    updateUser.mutate({
      userId: user.id,
      payload: { isActive: !user.isActive },
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{user.fullName}</CardTitle>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>

          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? "Active" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Select value={user.role} onValueChange={setRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>

            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={updateUser.isPending}
            onClick={toggleActive}
          >
            {user.isActive ? "Disable" : "Enable"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Joined {new Date(user.createdAt).toLocaleDateString()}
          {user.skillLevel
            ? ` · ${user.skillLevel.charAt(0)}${user.skillLevel
                .slice(1)
                .toLowerCase()}`
            : ""}
        </p>
      </CardContent>
    </Card>
  );
}
