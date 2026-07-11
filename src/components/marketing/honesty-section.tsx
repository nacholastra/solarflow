import { MARKETING } from "@/lib/config/marketing";
import { SectionHeader } from "@/components/marketing/section-header";
import { RevealOnScroll } from "@/components/marketing/reveal-on-scroll";
import { ShieldCheck } from "lucide-react";

export function HonestySection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <RevealOnScroll>
          <SectionHeader
            eyebrow="Transparencia"
            title={MARKETING.honesty.title}
            description="Preferimos que sepas exactamente qué obtienes antes de contratar."
          />
        </RevealOnScroll>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {MARKETING.honesty.items.map((item, index) => (
            <RevealOnScroll key={item.title} delay={index * 80}>
              <article className="h-full rounded-xl border border-border/60 bg-card p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-solar" aria-hidden />
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
