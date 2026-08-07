import HeroSection from "../sections/HeroSection";
import WhatIsSection from "../sections/WhatIsSection";
import HowItWorksSection from "../sections/HowItWorksSection";
import ArchitectureSection from "../sections/ArchitectureSection";
import StackSection from "../sections/StackSection";
import MetricsSection from "../sections/MetricsSection";
import ExperienceSection from "../sections/ExperienceSection";
import FAQSection from "../sections/FAQSection";
import ForgeCTASection from "../sections/ForgeCTASection";

export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <HeroSection />
      <WhatIsSection />
      <HowItWorksSection />
      <ArchitectureSection />
      <StackSection />
      <MetricsSection />
      <ExperienceSection />
      <FAQSection />
      <ForgeCTASection />
    </main>
  );
}