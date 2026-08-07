import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";

import ProfileForm from "../components/ProfileForm";

export default function ProfilePage() {
  return (
    <PageContainer size="narrow">
      <PageHeader
        title="My Profile"
        description="Manage your account information."
      />

      <ProfileForm />
    </PageContainer>
  );
}