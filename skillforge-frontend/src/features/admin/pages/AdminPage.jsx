import { FolderCog, LayoutDashboard, Layers, Users } from "lucide-react";

import PageContainer from "@/components/common/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CatalogManager from "../components/CatalogManager";
import UsersPanel from "../components/UsersPanel";
import StatsPanel from "../components/StatsPanel";

export default function AdminPage() {
  return (
    <PageContainer className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border bg-card p-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 120% at 0% 0%, color-mix(in oklch, var(--ember) 16%, transparent), transparent 55%)",
          }}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-ember">
          <Layers className="size-3.5" />
          Content Studio
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Creator Console
        </h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          Shape the learning journey — compose resources into guided sections,
          manage the catalog, and support learners.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">
            <LayoutDashboard className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="size-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content">
            <FolderCog className="size-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <StatsPanel />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersPanel />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <CatalogManager />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
