"use client";

import Link from "next/link";
import type { LeadWithStats } from "@/types";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface LeadTableProps {
  leads: LeadWithStats[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
}

export default function LeadTable({ leads, page, totalPages, onPageChange, onDelete }: LeadTableProps) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/5 bg-background/50">
              <th className="px-4 py-3 text-left font-medium text-muted">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Fecha</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Tiempo visto</th>
              <th className="px-4 py-3 text-center font-medium text-muted">CTA</th>
              <th className="px-4 py-3 text-center font-medium text-muted">Emails</th>
              <th className="px-4 py-3 text-left font-medium text-muted">UTM</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-foreground/5 hover:bg-background/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads?id=${lead.id}`} className="text-primary hover:underline font-medium">
                    {lead.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{lead.email}</td>
                <td className="px-4 py-3 text-muted">{formatDate(lead.createdAt)}</td>
                <td className="px-4 py-3">{formatTime(lead.maxWatchTime)}</td>
                <td className="px-4 py-3 text-center">
                  {lead.ctaClicked ? (
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Click</span>
                  ) : lead.ctaShown ? (
                    <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Visto</span>
                  ) : (
                    <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">No</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">{lead.emailsSent}</td>
                <td className="px-4 py-3 text-xs text-muted">{lead.utmSource || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(lead.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    title="Eliminar lead"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted">
                  Aun no hay leads registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-foreground/5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="text-sm text-primary hover:underline disabled:text-muted disabled:no-underline"
          >
            Anterior
          </button>
          <span className="text-sm text-muted">
            Pagina {page} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="text-sm text-primary hover:underline disabled:text-muted disabled:no-underline"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
