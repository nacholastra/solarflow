import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { TrustBar } from "@/components/marketing/trust-bar";
import { ProblemSection } from "@/components/marketing/problem-section";
import { FeaturesSection, MetricsStrip } from "@/components/marketing/features-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { LandingJsonLd } from "@/components/marketing/landing-json-ld";
import { buildLandingMetadata } from "@/lib/config/seo";

export const metadata = buildLandingMetadata();

export default function HomePage() {
  return (
    <>
      <LandingJsonLd />
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main id="main-content">
          <HeroSection />
          <TrustBar />
          <ProblemSection />
          <FeaturesSection />
          <MetricsStrip />
          <ProductShowcase />
          <HowItWorksSection />
          <PricingSection />
          <FaqSection />
          <CtaSection />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
