"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { TRIAL_DAYS } from "@/lib/config/trial";

export function HeroCTAs() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(Boolean(session));
    });
  }, []);

  if (isAuthenticated) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/dashboard">
            Ir al panel
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button size="lg" variant="solar" asChild>
        <Link href="/register">
          Probar {TRIAL_DAYS} días gratis
          <ArrowRight className="size-4" />
        </Link>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <a href="#contacto">
          <MessageCircle className="size-4" />
          Hablar con nosotros
        </a>
      </Button>
    </div>
  );
}
