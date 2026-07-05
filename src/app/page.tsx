import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "SolarFlow — Simulador solar y CRM para instaladoras",
  description:
    "Capta leads cualificados con un simulador de rentabilidad embebible, cálculos por ciudad en España y CRM Kanban. Planes desde 60 USD/mes.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
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
  );
}
