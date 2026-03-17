import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
