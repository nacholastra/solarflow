import Image from "next/image";
import { Check } from "lucide-react";
import { HeroCTAs } from "@/components/marketing/hero-ctas";
import { WidgetBrowserMock } from "@/components/marketing/widget-browser-mock";
import { MARKETING } from "@/lib/config/marketing";

export function HeroSection() {
  const { hero } = MARKETING;

  return (
    <section
      className="marketing-gradient relative overflow-hidden border-b border-border"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 pb-24 md:grid-cols-2 md:items-center md:px-6 md:py-24 md:pb-28 lg:py-28 lg:pb-32">
        <div className="flex flex-col items-start">
          <span className="marketing-hero-in marketing-hero-in-delay-1 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-positive" />
            {hero.eyebrow}
          </span>

          <h1
            id="hero-heading"
            className="marketing-hero-in marketing-hero-in-delay-2 mt-6 text-pretty text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]"
          >
            {hero.title}
          </h1>

          <p className="marketing-hero-in marketing-hero-in-delay-3 mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            {hero.subtitle}
          </p>

          <div className="marketing-hero-in marketing-hero-in-delay-4 w-full">
            <HeroCTAs />
          </div>

          <ul className="marketing-hero-in marketing-hero-in-delay-5 mt-8 flex flex-col gap-2.5">
            {hero.highlights.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="flex size-5 items-center justify-center rounded-full bg-positive/15 text-positive">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="marketing-hero-in marketing-hero-in-delay-3 relative mx-auto w-full max-w-lg md:max-w-none">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border/80 shadow-elevated">
            <Image
              src="/solar-rooftop-aerial.png"
              alt="Paneles solares instalados en una cubierta residencial"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 540px"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent"
              aria-hidden
            />
          </div>

          <div className="absolute -bottom-6 left-2 right-2 sm:-bottom-8 sm:left-auto sm:right-0 sm:w-[min(100%,300px)]">
            <WidgetBrowserMock compact className="ring-1 ring-border/80" />
          </div>
        </div>
      </div>
    </section>
  );
}
