import QuizSetupForm from "../components/QuizSetupForm";

import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";

export default function QuizSetupPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Generate Quiz"
        description="Customize your quiz before starting."
      />

      <QuizSetupForm />
    </PageContainer>
  );
}
