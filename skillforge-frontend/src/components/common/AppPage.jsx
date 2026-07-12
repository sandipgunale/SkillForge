import PageContainer from "./PageContainer";
import PageHeader from "./PageHeader";

export default function AppPage({ title, description, children }) {
  return (
    <PageContainer className="space-y-8">
      <PageHeader title={title} description={description} />

      {children}
    </PageContainer>
  );
}
