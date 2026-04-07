"use client";

interface TimelineEvent {
  id: number;
  eventType: string;
  timestampSec: number;
  metadata: string | null;
  createdAt: Date;
}

interface EmailEntry {
  id: number;
  emailType: string;
  sentAt: Date;
  status: string;
}

interface LeadTimelineProps {
  events: TimelineEvent[];
  emails: EmailEntry[];
}

function formatVideoTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const eventLabels: Record<string, string> = {
  play: "Reprodujo",
  pause: "Pauso",
  seek_back: "Retrocedio",
  timeupdate: "Viendo",
  ended: "Video terminado",
  cta_shown: "CTA mostrado",
  cta_clicked: "CTA clickeado",
  page_leave: "Abandono pagina",
};

const eventColors: Record<string, string> = {
  play: "bg-green-500",
  pause: "bg-yellow-500",
  seek_back: "bg-blue-500",
  timeupdate: "bg-gray-300",
  ended: "bg-green-600",
  cta_shown: "bg-purple-500",
  cta_clicked: "bg-purple-700",
  page_leave: "bg-red-500",
};

export default function LeadTimeline({ events, emails }: LeadTimelineProps) {
  // Filter out timeupdate events for the timeline (too noisy)
  const significantEvents = events.filter((e) => e.eventType !== "timeupdate");

  return (
    <div className="space-y-6">
      {/* Video events timeline */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6">
        <h3 className="text-lg font-semibold mb-4">Recorrido en el VSL</h3>
        {significantEvents.length === 0 ? (
          <p className="text-muted text-sm">No hay eventos registrados</p>
        ) : (
          <div className="space-y-3">
            {significantEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${eventColors[event.eventType] || "bg-gray-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">
                      {eventLabels[event.eventType] || event.eventType}
                    </span>
                    <span className="text-xs text-muted">
                      en {formatVideoTime(event.timestampSec)}
                    </span>
                  </div>
                  {event.metadata && (
                    <p className="text-xs text-muted mt-0.5">
                      {JSON.parse(event.metadata).from
                        ? `Desde ${formatVideoTime(JSON.parse(event.metadata).from)}`
                        : event.metadata}
                    </p>
                  )}
                  <p className="text-xs text-muted/60">{formatDateTime(event.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emails sent */}
      <div className="rounded-2xl border border-foreground/5 bg-white p-6">
        <h3 className="text-lg font-semibold mb-4">Emails Enviados</h3>
        {emails.length === 0 ? (
          <p className="text-muted text-sm">No se han enviado emails</p>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <div key={email.id} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="text-sm font-medium">{email.emailType.replace(/_/g, " ")}</span>
                  <span className="text-xs text-muted ml-2">
                    {formatDateTime(email.sentAt)} — {email.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
