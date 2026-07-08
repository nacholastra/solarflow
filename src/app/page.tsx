import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { LandingJsonLd } from "@/components/marketing/landing-json-ld";
import { LandingAnalytics } from "@/components/analytics/landing-analytics";
import { buildLandingMetadata } from "@/lib/config/seo";

export const metadata = buildLandingMetadata();

export default function HomePage() {
  return (
    <>
      <LandingAnalytics />
      <LandingJsonLd />
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main id="main-content" className="flex-1">
          <HeroSection />
          <FeaturesSection />
          <ProductShowcase />
          <HowItWorksSection />
          <PricingSection />
          <FaqSection />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
