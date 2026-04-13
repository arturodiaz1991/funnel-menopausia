"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/app/admin/layout";
import FunnelPreview, {
  FunnelDesignConfig,
  FormField,
  FONT_OPTIONS,
  DEFAULT_FIELDS,
  loadGoogleFont,
} from "@/components/funnel-preview";

// ─── constants ──────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  { label: "Cobre cálido (por defecto)", primary: "#9b6b4a", bg: "#f9f5f0", heading: "#1a1a1a", body: "#6b7280" },
  { label: "Verde salud", primary: "#2f7a5f", bg: "#f0f9f5", heading: "#0d2d22", body: "#4a7060" },
  { label: "Azul serenidad", primary: "#3d6fb5", bg: "#f0f5fc", heading: "#162846", body: "#4a5f80" },
  { label: "Rosa suave", primary: "#c2718c", bg: "#fdf3f6", heading: "#2d1520", body: "#7a4a58" },
  { label: "Morado sabio", primary: "#7c5cbf", bg: "#f5f2fc", heading: "#1e1530", body: "#5a4a7a" },
  { label: "Gris moderno", primary: "#374151", bg: "#f8f9fa", heading: "#111827", body: "#6b7280" },
  { label: "Naranja energía", primary: "#e07a30", bg: "#fff8f2", heading: "#2d1506", body: "#7a5038" },
  { label: "Negro elegante", primary: "#1a1a1a", bg: "#ffffff", heading: "#000000", body: "#6b7280" },
];

const BUTTON_STYLES = [
  { value: "filled", label: "Relleno sólido" },
  { value: "outline", label: "Contorno" },
  { value: "gradient", label: "Degradado" },
  { value: "ghost", label: "Transparente" },
];

const RADIUS_OPTIONS = [
  { value: "none", label: "Sin redondeo" },
  { value: "sm", label: "Ligero" },
  { value: "md", label: "Medio" },
  { value: "lg", label: "Grande" },
  { value: "full", label: "Píldora" },
];

const FIELD_TYPES = [
  { value: "text", label: "Texto" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Teléfono" },
  { value: "textarea", label: "Área de texto" },
];

const TABS = [
  { id: "content", label: "Contenido", icon: "✏️" },
  { id: "colors", label: "Colores", icon: "🎨" },
  { id: "typography", label: "Tipografía", icon: "T" },
  { id: "button", label: "Botón", icon: "⬜" },
  { id: "form", label: "Formulario", icon: "📋" },
  { id: "images", label: "Imágenes", icon: "🖼️" },
  { id: "vsl", label: "VSL", icon: "▶️" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const DEFAULT_CONFIG: FunnelDesignConfig = {
  landing_headline: "",
  landing_subheadline: "",
  landing_cta_text: "",
  bg_color: "#f9f5f0",
  primary_color: "#9b6b4a",
  heading_color: "#1a1a1a",
  body_color: "#6b7280",
  heading_font: "inter",
  heading_weight: "700",
  button_style: "filled",
  button_radius: "lg",
  button_shadow: true,
  button_text_color: "#ffffff",
  extra_form_fields: [],
  video_url: "",
  school_url: "",
  cta_timestamp_seconds: "",
};

// ─── helper components ───────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-primary/60 border-b border-foreground/5 pb-2">{title}</p>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all ${className}`}
    />
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 rounded-md cursor-pointer border border-foreground/10 p-0.5 bg-white"
        />
        <TextInput value={value} onChange={onChange} placeholder="#000000" className="flex-1" />
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { password } = useAdmin();
  const router = useRouter();

  const [funnelName, setFunnelName] = useState("Cargando...");
  const [config, setConfig] = useState<FunnelDesignConfig>({ ...DEFAULT_CONFIG });
  const [activeTab, setActiveTab] = useState<TabId>("content");
  const [viewport, setViewport] = useState<"mobile" | "desktop">("mobile");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const headers = { "x-admin-password": password };

  // Load funnel
  useEffect(() => {
    if (!password) return;
    fetch(`/api/admin/funnels/${id}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        setFunnelName(data.name || "Sin nombre");
        // Merge saved config over defaults
        const merged: FunnelDesignConfig = { ...DEFAULT_CONFIG, ...(data.config || {}) };
        if (!Array.isArray(merged.extra_form_fields)) merged.extra_form_fields = [];
        setConfig(merged);
      })
      .finally(() => setLoading(false));
  }, [password, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load font when heading_font changes
  useEffect(() => {
    loadGoogleFont(config.heading_font || "inter");
  }, [config.heading_font]);

  const updateConfig = useCallback(<K extends keyof FunnelDesignConfig>(key: K, value: FunnelDesignConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/admin/funnels/${id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
    } finally {
      setSaving(false);
    }
  }

  // ─── extra fields helpers ────────────────────────────────────────────────

  function addField() {
    const newField: FormField = {
      id: crypto.randomUUID(),
      label: "Nuevo campo",
      type: "text",
      placeholder: "",
      required: false,
    };
    updateConfig("extra_form_fields", [...(config.extra_form_fields || []), newField]);
  }

  function updateField(fieldId: string, updates: Partial<FormField>) {
    updateConfig(
      "extra_form_fields",
      (config.extra_form_fields || []).map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  }

  function removeField(fieldId: string) {
    updateConfig(
      "extra_form_fields",
      (config.extra_form_fields || []).filter((f) => f.id !== fieldId)
    );
  }

  function moveField(fieldId: string, dir: -1 | 1) {
    const fields = [...(config.extra_form_fields || [])];
    const idx = fields.findIndex((f) => f.id === fieldId);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= fields.length) return;
    [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
    updateConfig("extra_form_fields", fields);
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <p className="text-muted text-sm">Cargando editor...</p>
      </div>
    );
  }

  // ─── render ──────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-[#f1f3f5] flex flex-col z-50">
      {/* Top bar */}
      <header className="shrink-0 h-14 bg-white border-b border-foreground/10 flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-muted hover:text-foreground transition-colors text-sm flex items-center gap-1"
          >
            ← Volver
          </button>
          <span className="text-foreground/20">|</span>
          <span className="text-sm font-semibold text-foreground truncate max-w-xs">{funnelName}</span>
        </div>

        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs text-green-600 hidden sm:block">Guardado a las {savedAt}</span>
          )}
          {/* Viewport toggle */}
          <div className="flex rounded-lg border border-foreground/10 overflow-hidden">
            <button
              onClick={() => setViewport("mobile")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewport === "mobile" ? "bg-primary text-white" : "bg-white text-muted hover:bg-foreground/5"}`}
            >
              📱 Móvil
            </button>
            <button
              onClick={() => setViewport("desktop")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewport === "desktop" ? "bg-primary text-white" : "bg-white text-muted hover:bg-foreground/5"}`}
            >
              🖥️ Escritorio
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60 transition-colors"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="shrink-0 w-72 bg-white border-r border-foreground/10 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-0 border-b border-foreground/10 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`shrink-0 flex flex-col items-center gap-0.5 px-3 pt-3 pb-2 text-[10px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* ── CONTENIDO ── */}
            {activeTab === "content" && (
              <Section title="Textos de la landing">
                <div>
                  <Label>Titular principal</Label>
                  <textarea
                    rows={2}
                    value={config.landing_headline || ""}
                    onChange={(e) => updateConfig("landing_headline", e.target.value)}
                    placeholder="Reduce el insomnio en la menopausia"
                    className="w-full rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
                  />
                </div>
                <div>
                  <Label>Subtítulo / descripción</Label>
                  <textarea
                    rows={3}
                    value={config.landing_subheadline || ""}
                    onChange={(e) => updateConfig("landing_subheadline", e.target.value)}
                    placeholder="Descubre métodos naturales y efectivos..."
                    className="w-full rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
                  />
                </div>
                <div>
                  <Label>Texto del botón CTA</Label>
                  <TextInput
                    value={config.landing_cta_text || ""}
                    onChange={(v) => updateConfig("landing_cta_text", v)}
                    placeholder="Acceder a la Clase Gratuita"
                  />
                </div>
              </Section>
            )}

            {/* ── COLORES ── */}
            {activeTab === "colors" && (
              <>
                <Section title="Paletas predefinidas">
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.primary}
                        onClick={() => {
                          updateConfig("primary_color", preset.primary);
                          updateConfig("bg_color", preset.bg);
                          updateConfig("heading_color", preset.heading);
                          updateConfig("body_color", preset.body);
                        }}
                        className="flex items-center gap-2 rounded-lg border border-foreground/10 p-2 hover:border-primary/50 text-left transition-colors"
                      >
                        <div
                          className="h-6 w-6 rounded-full shrink-0 ring-1 ring-foreground/10"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="text-[11px] leading-tight text-foreground/70 line-clamp-2">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Personalizar colores">
                  <ColorPicker
                    label="Color principal (botón, acentos)"
                    value={config.primary_color || "#9b6b4a"}
                    onChange={(v) => updateConfig("primary_color", v)}
                  />
                  <ColorPicker
                    label="Color de fondo"
                    value={config.bg_color || "#f9f5f0"}
                    onChange={(v) => updateConfig("bg_color", v)}
                  />
                  <ColorPicker
                    label="Color del titular"
                    value={config.heading_color || "#1a1a1a"}
                    onChange={(v) => updateConfig("heading_color", v)}
                  />
                  <ColorPicker
                    label="Color del texto"
                    value={config.body_color || "#6b7280"}
                    onChange={(v) => updateConfig("body_color", v)}
                  />
                  <ColorPicker
                    label="Color texto del botón"
                    value={config.button_text_color || "#ffffff"}
                    onChange={(v) => updateConfig("button_text_color", v)}
                  />
                </Section>
              </>
            )}

            {/* ── TIPOGRAFÍA ── */}
            {activeTab === "typography" && (
              <Section title="Fuente del titular">
                <div>
                  <Label>Fuente</Label>
                  <div className="space-y-2">
                    {FONT_OPTIONS.map((font) => {
                      const isSelected = (config.heading_font || "inter") === font.value;
                      return (
                        <button
                          key={font.value}
                          onClick={() => {
                            loadGoogleFont(font.value);
                            updateConfig("heading_font", font.value);
                          }}
                          className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-foreground/10 hover:border-primary/30"
                          }`}
                        >
                          <span
                            style={{ fontFamily: font.family, fontWeight: 700, fontSize: "18px", lineHeight: 1 }}
                            className="w-8 text-center shrink-0"
                          >
                            Aa
                          </span>
                          <span className="text-sm">{font.label}</span>
                          {isSelected && <span className="ml-auto text-xs font-semibold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>Grosor del titular</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { value: "400", label: "Regular" },
                      { value: "600", label: "Semibold" },
                      { value: "700", label: "Bold" },
                      { value: "800", label: "Extra" },
                    ].map((w) => (
                      <button
                        key={w.value}
                        onClick={() => updateConfig("heading_weight", w.value)}
                        style={{ fontWeight: w.value }}
                        className={`rounded-lg border py-2 text-xs transition-all ${
                          (config.heading_weight || "700") === w.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-foreground/10 text-muted hover:border-primary/30"
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* ── BOTÓN ── */}
            {activeTab === "button" && (
              <Section title="Estilo del botón CTA">
                <div>
                  <Label>Estilo</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {BUTTON_STYLES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => updateConfig("button_style", s.value)}
                        className={`rounded-lg border px-3 py-2.5 text-sm text-center transition-all ${
                          (config.button_style || "filled") === s.value
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-foreground/10 text-muted hover:border-primary/30"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Bordes</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {RADIUS_OPTIONS.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => updateConfig("button_radius", r.value)}
                        className={`rounded-lg border py-2 text-xs transition-all ${
                          (config.button_radius || "lg") === r.value
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-foreground/10 text-muted hover:border-primary/30"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="btn-shadow"
                    checked={config.button_shadow ?? true}
                    onChange={(e) => updateConfig("button_shadow", e.target.checked)}
                    className="h-4 w-4 accent-primary cursor-pointer"
                  />
                  <label htmlFor="btn-shadow" className="text-sm text-foreground cursor-pointer">
                    Sombra en el botón
                  </label>
                </div>
              </Section>
            )}

            {/* ── FORMULARIO ── */}
            {activeTab === "form" && (
              <Section title="Campos del formulario">
                {/* Fixed fields (read-only labels) */}
                <div className="space-y-2">
                  <p className="text-xs text-muted">Campos fijos (siempre presentes):</p>
                  {DEFAULT_FIELDS.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 rounded-lg bg-foreground/3 border border-foreground/5 px-3 py-2"
                    >
                      <span className="text-xs text-muted flex-1">{f.label}</span>
                      <span className="text-[10px] text-muted uppercase">{f.type}</span>
                    </div>
                  ))}
                </div>

                {/* Extra fields */}
                <div className="space-y-3">
                  <p className="text-xs text-muted">Campos adicionales:</p>
                  {(config.extra_form_fields || []).length === 0 && (
                    <p className="text-xs text-muted italic">Sin campos adicionales.</p>
                  )}
                  {(config.extra_form_fields || []).map((field, idx) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-foreground/10 bg-foreground/2 p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground/50">Campo {idx + 1}</span>
                        <div className="flex ml-auto gap-1">
                          <button
                            onClick={() => moveField(field.id, -1)}
                            disabled={idx === 0}
                            className="text-muted text-xs px-1.5 py-0.5 rounded border border-foreground/10 hover:bg-foreground/5 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveField(field.id, 1)}
                            disabled={idx === (config.extra_form_fields || []).length - 1}
                            className="text-muted text-xs px-1.5 py-0.5 rounded border border-foreground/10 hover:bg-foreground/5 disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeField(field.id)}
                            className="text-red-400 text-xs px-1.5 py-0.5 rounded border border-red-200 hover:bg-red-50"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label>Etiqueta</Label>
                        <TextInput
                          value={field.label}
                          onChange={(v) => updateField(field.id, { label: v })}
                          placeholder="Ej: Teléfono"
                        />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as FormField["type"] })}
                          className="w-full rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Placeholder</Label>
                        <TextInput
                          value={field.placeholder}
                          onChange={(v) => updateField(field.id, { placeholder: v })}
                          placeholder="Texto de ejemplo"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`req-${field.id}`}
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="h-4 w-4 accent-primary cursor-pointer"
                        />
                        <label htmlFor={`req-${field.id}`} className="text-xs text-foreground cursor-pointer">
                          Campo obligatorio
                        </label>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addField}
                    className="w-full rounded-lg border-2 border-dashed border-foreground/15 py-2.5 text-sm text-muted hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    + Añadir campo
                  </button>
                </div>
              </Section>
            )}

            {/* ── IMÁGENES ── */}
            {activeTab === "images" && (
              <Section title="Imágenes">
                <div>
                  <Label>URL del logo</Label>
                  <TextInput
                    value={config.logo_url || ""}
                    onChange={(v) => updateConfig("logo_url", v)}
                    placeholder="https://tudominio.com/logo.png"
                  />
                  <p className="text-[11px] text-muted mt-1">Aparece centrado en la parte superior.</p>
                </div>
                <div>
                  <Label>URL imagen hero (encima del titular)</Label>
                  <TextInput
                    value={config.hero_image_url || ""}
                    onChange={(v) => updateConfig("hero_image_url", v)}
                    placeholder="https://tudominio.com/imagen.jpg"
                  />
                  <p className="text-[11px] text-muted mt-1">Imagen grande antes del texto. Aspect ratio libre.</p>
                </div>
                <div>
                  <Label>URL imagen de fondo</Label>
                  <TextInput
                    value={config.bg_image_url || ""}
                    onChange={(v) => updateConfig("bg_image_url", v)}
                    placeholder="https://tudominio.com/fondo.jpg"
                  />
                  <p className="text-[11px] text-muted mt-1">Cubre toda la pantalla (cover). El color de fondo se usa como fallback.</p>
                </div>
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
                  <strong>Tip:</strong> Sube tus imágenes a un servicio gratuito como{" "}
                  <strong>Cloudinary</strong> o <strong>ImgBB</strong> y pega aquí la URL directa.
                </div>
              </Section>
            )}

            {/* ── VSL ── */}
            {activeTab === "vsl" && (
              <Section title="Configuración del VSL">
                <div>
                  <Label>URL del vídeo (override global)</Label>
                  <TextInput
                    value={config.video_url || ""}
                    onChange={(v) => updateConfig("video_url", v)}
                    placeholder="https://... (vacío = usa la global)"
                  />
                </div>
                <div>
                  <Label>URL del CTA / School (override global)</Label>
                  <TextInput
                    value={config.school_url || ""}
                    onChange={(v) => updateConfig("school_url", v)}
                    placeholder="https://... (vacío = usa la global)"
                  />
                </div>
                <div>
                  <Label>Segundo de aparición del CTA</Label>
                  <TextInput
                    type="number"
                    value={String(config.cta_timestamp_seconds || "")}
                    onChange={(v) => updateConfig("cta_timestamp_seconds", v)}
                    placeholder="1500 (vacío = usa la global)"
                  />
                </div>
              </Section>
            )}
          </div>
        </aside>

        {/* Preview */}
        <main className="flex-1 overflow-auto flex flex-col items-center py-8 px-4 gap-4">
          <div
            className={`bg-white shadow-2xl overflow-auto transition-all duration-300 ${
              viewport === "mobile"
                ? "w-[390px] min-h-[844px] rounded-[32px] ring-4 ring-foreground/10"
                : "w-full max-w-[1200px] min-h-[700px] rounded-2xl"
            }`}
          >
            <FunnelPreview config={config} />
          </div>
          <p className="text-xs text-muted">Vista previa — los cambios no se guardan hasta hacer clic en "Guardar"</p>
        </main>
      </div>
    </div>
  );
}
