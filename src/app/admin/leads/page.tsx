"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAdmin } from "../layout";
import LeadTable from "@/components/admin/lead-table";
import LeadTimeline from "@/components/admin/lead-timeline";
import type { LeadWithStats } from "@/types";

interface LeadDetail {
  lead: {
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
  };
  sessions: Array<{
    id: string;
    maxTimestampSec: number;
    ctaShown: boolean;
    ctaClicked: boolean;
    startedAt: string;
  }>;
  events: Array<{
    id: number;
    eventType: string;
    timestampSec: number;
    metadata: string | null;
    createdAt: Date;
  }>;
  emails: Array<{
    id: number;
    emailType: string;
    sentAt: Date;
    status: string;
  }>;
}

export default function LeadsPage() {
  const { password } = useAdmin();
  const searchParams = useSearchParams();
  const selectedLeadId = searchParams.get("id");

  const [leads, setLeads] = useState<LeadWithStats[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [leadDetail, setLeadDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!password) return;

    if (selectedLeadId) {
      fetchLeadDetail(selectedLeadId);
    } else {
      fetchLeads();
    }
  }, [password, page, selectedLeadId]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads?page=${page}`, {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLeadDetail(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        setLeadDetail(await res.json());
      }
    } catch (error) {
      console.error("Error fetching lead detail:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="text-muted">Cargando...</p>;
  }

  if (selectedLeadId && leadDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <a href="/admin/leads" className="text-primary hover:underline text-sm">&larr; Volver</a>
          <h1 className="text-2xl font-bold">{leadDetail.lead.fullName}</h1>
        </div>

        <div className="rounded-2xl border border-foreground/5 bg-white p-6">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <span className="text-muted">Email</span>
              <p className="font-medium">{leadDetail.lead.email}</p>
            </div>
            <div>
              <span className="text-muted">Registro</span>
              <p className="font-medium">{new Date(leadDetail.lead.createdAt).toLocaleDateString("es-ES")}</p>
            </div>
            <div>
              <span className="text-muted">UTM Source</span>
              <p className="font-medium">{leadDetail.lead.utmSource || "-"}</p>
            </div>
            <div>
              <span className="text-muted">UTM Campaign</span>
              <p className="font-medium">{leadDetail.lead.utmCampaign || "-"}</p>
            </div>
          </div>
        </div>

        <LeadTimeline events={leadDetail.events} emails={leadDetail.emails} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leads</h1>
      <LeadTable leads={leads} page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
