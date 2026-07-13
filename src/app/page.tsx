import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { LaunchOfferBanner } from "@/components/marketing/launch-offer-banner";
import { HeroSection } from "@/components/marketing/hero-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { HonestySection } from "@/components/marketing/honesty-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { ContactSection } from "@/components/marketing/contact-section";
import { LandingJsonLd } from "@/components/marketing/landing-json-ld";
import { ConditionalAnalytics } from "@/components/analytics/conditional-analytics";
import { buildLandingMetadata } from "@/lib/config/seo";
import { getLaunchOfferStatus } from "@/lib/config/launch-offer-status";

export const metadata = buildLandingMetadata();

export default async function HomePage() {
  const offer = await getLaunchOfferStatus();

  return (
    <>
      <ConditionalAnalytics />
      <LandingJsonLd />
      <div className="flex min-h-dvh flex-col">
        <LaunchOfferBanner offer={offer} />
        <SiteHeader />
        <main id="main-content" className="flex-1">
          <HeroSection />
          <ProductShowcase />
          <FeaturesSection />
          <HowItWorksSection />
          <HonestySection />
          <PricingSection offer={offer} />
          <FaqSection />
          <ContactSection />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
