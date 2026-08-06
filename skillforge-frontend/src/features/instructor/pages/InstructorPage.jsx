import { Gauge, Library } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import PageContainer from "@/components/common/PageContainer";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OverviewPanel from "../components/OverviewPanel";
import ResourceManager from "../components/ResourceManager";

export default function InstructorPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Instructor Hub"
        description="Track your progress and manage learning content."
      />

      <Tabs defaultValue="overview">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">
            <Gauge className="size-4" />
            Overview
          </TabsTrigger>

          <TabsTrigger value="resources">
            <Library className="size-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewPanel />
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <ResourceManager />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
