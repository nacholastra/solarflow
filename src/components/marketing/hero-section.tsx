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
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 md:py-24 lg:py-28">
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-positive" />
            {hero.eyebrow}
          </span>

          <h1
            id="hero-heading"
            className="mt-6 text-pretty text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]"
          >
            {hero.title}
          </h1>

          <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            {hero.subtitle}
          </p>

          <HeroCTAs />

          <ul className="mt-8 flex flex-col gap-2.5">
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

        <div className="relative">
          <WidgetBrowserMock compact className="shadow-elevated" />
          <div className="absolute -bottom-5 -left-5 hidden max-w-[240px] rounded-xl border border-border/80 bg-card/95 p-4 shadow-elevated backdrop-blur-sm sm:block">
            <p className="text-xs font-medium text-muted-foreground">Plan Basic</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {MARKETING.trust[0].value}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              {MARKETING.trust[1].value}
              <br />
              {MARKETING.trust[3].value}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
