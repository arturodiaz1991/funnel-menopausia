import { NextRequest, NextResponse } from "next/server";
import { getLeadsForExport } from "@/db/queries";
import { config } from "@/lib/config";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== config.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters = {
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    minWatchMinutes: searchParams.get("minWatchMinutes")
      ? Number(searchParams.get("minWatchMinutes"))
      : undefined,
    funnelStage: (searchParams.get("funnelStage") || "all") as "all" | "vsl" | "cta_shown" | "cta_clicked",
    emailSent: (searchParams.get("emailSent") || "all") as "all" | "yes" | "no",
  };

  const leads = await getLeadsForExport(filters);

  const headers = [
    "Nombre",
    "Email",
    "Fecha registro",
    "Tiempo visto (min:seg)",
    "Minutos vistos",
    "CTA mostrado",
    "CTA clickeado",
    "Emails enviados",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "UTM Content",
    "UTM Term",
  ];

  const rows = leads.map((lead) => [
    escapeCsv(lead.fullName),
    escapeCsv(lead.email),
    escapeCsv(new Date(lead.createdAt).toLocaleDateString("es-ES")),
    escapeCsv(formatTime(lead.maxWatchSeconds)),
    escapeCsv(String(Math.floor(lead.maxWatchSeconds / 60))),
    escapeCsv(lead.ctaShown ? "Sí" : "No"),
    escapeCsv(lead.ctaClicked ? "Sí" : "No"),
    escapeCsv(String(lead.emailsSent)),
    escapeCsv(lead.utmSource),
    escapeCsv(lead.utmMedium),
    escapeCsv(lead.utmCampaign),
    escapeCsv(lead.utmContent),
    escapeCsv(lead.utmTerm),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const bom = "\uFEFF"; // UTF-8 BOM para Excel

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
