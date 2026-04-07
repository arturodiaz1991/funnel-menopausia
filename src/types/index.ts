export interface VideoEvent {
  type: "play" | "pause" | "seek_back" | "timeupdate" | "ended" | "cta_shown" | "cta_clicked" | "page_leave";
  timestampSec: number;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsBatchPayload {
  sessionId: string;
  events: VideoEvent[];
}

export interface LeadFormData {
  fullName: string;
  email: string;
}

export interface LeadWithStats {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
  utmSource: string | null;
  utmCampaign: string | null;
  maxWatchTime: number;
  ctaShown: boolean;
  ctaClicked: boolean;
  emailsSent: number;
}

export interface FunnelStats {
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  vslViewRate: number;
  avgWatchTimeSec: number;
  ctaShowRate: number;
  ctaClickRate: number;
}

export interface HeatmapDataPoint {
  second: number;
  viewerCount: number;
  viewerPercent: number;
}
