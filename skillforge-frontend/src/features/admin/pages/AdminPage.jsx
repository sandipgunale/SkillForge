import { FolderCog, LayoutDashboard, Users } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import PageContainer from "@/components/common/PageContainer";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CatalogManager from "../components/CatalogManager";
import UsersPanel from "../components/UsersPanel";
import StatsPanel from "../components/StatsPanel";

export default function AdminPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Admin Panel"
        description="Platform overview, users and content catalog."
      />

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
