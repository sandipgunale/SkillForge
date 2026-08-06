import { useLocation } from "react-router-dom";

import QuizSetupForm from "../components/QuizSetupForm";

import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";

export default function QuizSetupPage() {
  const location = useLocation();

  const preselection = location.state ?? {};

  return (
    <PageContainer>
      <PageHeader
        title="Generate Quiz"
        description="Customize your quiz before starting."
      />

      <QuizSetupForm preselection={preselection} />
    </PageContainer>
  );
}
