export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import LeadForm from "@/components/lead-form";
import LandingTracker from "@/components/landing-tracker";
import { getAppConfig } from "@/db/queries";

export default async function LandingPage() {
  try {
    const skipLanding = await getAppConfig("skip_landing");
    if (skipLanding === "true") redirect("/vsl");
  } catch {
    // Error de BD — mostrar landing normalmente
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <LandingTracker />
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Clase gratuita
          </p>
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Reduce el insomnio en la menopausia
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            Descubre metodos naturales y efectivos para volver a dormir bien.
            Accede gratis a nuestra clase exclusiva.
          </p>
        </div>

        <Suspense fallback={<div className="h-64" />}>
          <div className="flex justify-center">
            <LeadForm />
          </div>
        </Suspense>
      </div>
    </main>
  );
}
