import { cn } from "@/lib/utils";

function BrowserChrome({ url, className }: { url: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 border-b border-border bg-muted px-4 py-3", className)}>
      <span className="size-2.5 rounded-full bg-border" />
      <span className="size-2.5 rounded-full bg-border" />
      <span className="size-2.5 rounded-full bg-border" />
      <span className="ml-2 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
        {url}
      </span>
    </div>
  );
}

function WidgetPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("bg-background p-4", compact ? "p-3" : "p-5")}>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="bg-primary px-4 py-3 text-primary-foreground">
          <p className={cn("font-semibold", compact ? "text-sm" : "text-base")}>Simula tu ahorro solar</p>
          {!compact && (
            <p className="mt-0.5 text-xs text-primary-foreground/70">Estimación orientativa por localidad</p>
          )}
        </div>
        <div className={cn("space-y-3", compact ? "p-3" : "p-4")}>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border-2 border-solar bg-solar/10 p-2 text-center text-xs font-medium">
              Residencial
            </div>
            <div className="rounded-lg border border-border p-2 text-center text-xs text-muted-foreground">
              Comercial
            </div>
          </div>
          <div className="h-8 rounded-md border border-border bg-muted/50" />
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted p-2 text-center">
              <p className="text-[10px] text-muted-foreground">kWp</p>
              <p className="text-sm font-semibold">3,8</p>
            </div>
            <div className="rounded-lg bg-muted p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Ahorro</p>
              <p className="text-sm font-semibold text-positive">1.240 €</p>
            </div>
            <div className="rounded-lg bg-muted p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Payback</p>
              <p className="text-sm font-semibold">7,1 a</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WidgetBrowserMock({
  url = "tuinstaladora.es/simulador",
  compact = false,
  className,
}: {
  url?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/80 bg-background shadow-elevated", className)}>
      <BrowserChrome url={url} />
      <WidgetPreview compact={compact} />
    </div>
  );
}

export function IframeEmbedVisual({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
        <div className="border-b border-border bg-muted px-4 py-2">
          <p className="text-xs font-medium text-muted-foreground">Código iframe (desde tu panel)</p>
        </div>
        <pre className="overflow-x-auto p-4 text-[11px] leading-relaxed text-foreground sm:text-xs">
          <code>{`<iframe
  src="https://solarflow.app/widget/tu-empresa"
  width="100%"
  height="680"
  style="border:0;border-radius:12px"
  loading="lazy"
  title="Simulador solar"
></iframe>`}</code>
        </pre>
      </div>

      <WidgetBrowserMock url="tuinstaladora.es/simulador" />
    </div>
  );
}
