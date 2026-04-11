export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAppConfig } from "@/db/queries";
import FunnelLanding from "@/components/funnel-landing";

export default async function LandingPage() {
  try {
    const skipLanding = await getAppConfig("skip_landing");
    if (skipLanding === "true") redirect("/vsl");
  } catch {
    // Error de BD — mostrar landing normalmente
  }

  return <FunnelLanding />;
}
