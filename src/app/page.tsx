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
import { createClient } from "@/lib/supabase/server";

export const metadata = buildLandingMetadata();

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);

  return (
    <>
      <LandingAnalytics />
      <LandingJsonLd />
      <div className="flex min-h-dvh flex-col">
        <SiteHeader isAuthenticated={isAuthenticated} />
        <main id="main-content" className="flex-1">
          <HeroSection isAuthenticated={isAuthenticated} />
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
