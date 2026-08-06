import HeroSection from "../sections/HeroSection";
import PlatformPreviewSection from "../sections/PlatformPreviewSection";
import ProblemSection from "../sections/ProblemSection";
import MethodSection from "../sections/MethodSection";
import FeaturesSection from "../sections/FeaturesSection";
import AISection from "../sections/AISection";
import RolesSection from "../sections/RolesSection";
import TestimonialsSection from "../sections/TestimonialsSection";
import StatsBand from "../sections/StatsBand";
import FAQSection from "../sections/FAQSection";
import CTASection from "../sections/CTASection";

export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <HeroSection />
      <PlatformPreviewSection />
      <ProblemSection />
      <MethodSection />
      <FeaturesSection />
      <AISection />
      <RolesSection />
      <TestimonialsSection />
      <StatsBand />
      <FAQSection />
      <CTASection />
    </main>
  );
}
