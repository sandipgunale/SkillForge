import { useState } from "react";

import ErrorState from "@/components/common/ErrorState";
import DashboardSkeleton from "@/features/dashboard/skeletons/DashboardSkeleton";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ResourcePagination from "@/features/resources/components/ResourcePagination";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { useAdminUsers } from "../hooks/useAdminData";
import { useUpdateUser } from "../hooks/useUpdateUser";

const PAGE_SIZE = 20;

const ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN"];

const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Newest first" },
  { value: "createdAt,asc", label: "Oldest first" },
  { value: "fullName,asc", label: "Name (A–Z)" },
  { value: "email,asc", label: "Email (A–Z)" },
  { value: "role,asc", label: "Role" },
  { value: "isActive,desc", label: "Active first" },
];

const roleLabel = (role) => role.charAt(0) + role.slice(1).toLowerCase();

const initials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function UsersPanel() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt,desc");
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isError, refetch } = useAdminUsers({
    search: debouncedSearch || undefined,
    page,
    size: PAGE_SIZE,
    sort,
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

  const users = data?.content ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Search by name or email…"
            aria-label="Search users"
          />
        </div>

        <Select value={sort} onValueChange={(value) => { setSort(value); setPage(0); }}>
          <SelectTrigger className="w-44" aria-label="Sort users">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-background">
        <div className="hidden items-center gap-3 border-b bg-muted/30 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:flex">
          <span className="min-w-0 flex-1">User</span>
          <span className="w-36">Role</span>
          <span className="w-28">Status</span>
          <span className="w-32">Joined</span>
          <span className="w-24 text-right">Actions</span>
        </div>

        {isLoading && !data ? (
          <DashboardSkeleton />
        ) : users.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No users found.
          </p>
        ) : (
          <ul className="divide-y">
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </ul>
        )}
      </div>

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

function UserRow({ user }) {
  const updateUser = useUpdateUser();

  const setRole = (role) =>
    updateUser.mutate({ userId: user.id, payload: { role } });

  const toggleActive = () =>
    updateUser.mutate({
      userId: user.id,
      payload: { isActive: !user.isActive },
    });

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 md:flex-nowrap">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ember/10 text-xs font-semibold text-ember"
          aria-hidden="true"
        >
          {initials(user.fullName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="w-36">
        <Select value={user.role} onValueChange={setRole}>
          <SelectTrigger className="h-8 w-full" aria-label={`Role for ${user.fullName}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {roleLabel(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-28">
        {user.isActive ? (
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Disabled
          </Badge>
        )}
      </div>

      <div className="w-32 text-sm text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString()}
      </div>

      <div className="flex w-full justify-end md:w-24">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={updateUser.isPending}
          onClick={toggleActive}
        >
          {user.isActive ? "Disable" : "Enable"}
        </Button>
      </div>
    </li>
  );
}
