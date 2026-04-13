"use client";

import { useEffect } from "react";

export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  placeholder: string;
  required: boolean;
}

export interface FunnelDesignConfig {
  // Content
  landing_headline?: string;
  landing_subheadline?: string;
  landing_cta_text?: string;
  // Background
  bg_color?: string;
  bg_image_url?: string;
  // Images
  hero_image_url?: string;
  logo_url?: string;
  // Colors
  primary_color?: string;
  heading_color?: string;
  body_color?: string;
  // Typography
  heading_font?: string; // "inter" | "playfair" | "lora" | "montserrat" | "raleway" | "merriweather" | "nunito"
  heading_weight?: string; // "400" | "600" | "700" | "800"
  // Button
  button_style?: string; // "filled" | "outline" | "gradient" | "ghost"
  button_radius?: string; // "none" | "sm" | "md" | "lg" | "full"
  button_shadow?: boolean;
  button_text_color?: string;
  // Extra form fields
  extra_form_fields?: FormField[];
  // VSL
  video_url?: string;
  school_url?: string;
  cta_timestamp_seconds?: string | number;
}

export const FONT_OPTIONS = [
  { value: "inter", label: "Inter (Por defecto)", family: "'Inter', system-ui, sans-serif" },
  { value: "playfair", label: "Playfair Display", family: "'Playfair Display', Georgia, serif", google: "Playfair+Display:ital,wght@0,400;0,600;0,700;0,800" },
  { value: "lora", label: "Lora", family: "'Lora', Georgia, serif", google: "Lora:ital,wght@0,400;0,600;0,700" },
  { value: "montserrat", label: "Montserrat", family: "'Montserrat', system-ui, sans-serif", google: "Montserrat:wght@400;600;700;800" },
  { value: "raleway", label: "Raleway", family: "'Raleway', system-ui, sans-serif", google: "Raleway:wght@400;600;700;800" },
  { value: "merriweather", label: "Merriweather", family: "'Merriweather', Georgia, serif", google: "Merriweather:ital,wght@0,400;0,700" },
  { value: "nunito", label: "Nunito", family: "'Nunito', system-ui, sans-serif", google: "Nunito:wght@400;600;700;800" },
];

export const RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};

export const DEFAULT_FIELDS: FormField[] = [
  { id: "fullName", label: "Nombre completo", type: "text", placeholder: "Tu nombre completo", required: true },
  { id: "email", label: "Correo electrónico", type: "email", placeholder: "tu@correo.com", required: true },
];

export function loadGoogleFont(fontValue: string) {
  if (typeof document === "undefined") return;
  const font = FONT_OPTIONS.find((f) => f.value === fontValue);
  if (!font?.google) return;
  const id = `gfont-${fontValue}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
  document.head.appendChild(link);
}

export function getButtonStyles(config: FunnelDesignConfig): React.CSSProperties {
  const primaryColor = config.primary_color || "#9b6b4a";
  const textColor = config.button_text_color || "#ffffff";
  const radius = RADIUS_MAP[config.button_radius || "lg"] || "16px";
  const style = config.button_style || "filled";
  const shadow = config.button_shadow ?? false;

  const base: React.CSSProperties = {
    borderRadius: radius,
    boxShadow: shadow ? `0 4px 16px ${primaryColor}55` : "none",
    color: textColor,
    fontWeight: 600,
    padding: "14px 24px",
    width: "100%",
    fontSize: "16px",
    cursor: "default",
    border: "2px solid transparent",
    transition: "all 0.2s",
    fontFamily: "inherit",
    display: "block",
  };

  if (style === "filled") return { ...base, backgroundColor: primaryColor, borderColor: primaryColor };
  if (style === "outline") return { ...base, backgroundColor: "transparent", borderColor: primaryColor, color: primaryColor };
  if (style === "gradient") return { ...base, background: `linear-gradient(135deg, ${primaryColor}cc, ${primaryColor})`, borderColor: "transparent" };
  if (style === "ghost") return { ...base, backgroundColor: `${primaryColor}18`, borderColor: "transparent", color: primaryColor };
  return base;
}

export default function FunnelPreview({ config }: { config: FunnelDesignConfig }) {
  const fontValue = config.heading_font || "inter";
  const fontOption = FONT_OPTIONS.find((f) => f.value === fontValue) || FONT_OPTIONS[0];

  useEffect(() => {
    loadGoogleFont(fontValue);
  }, [fontValue]);

  const bgColor = config.bg_color || "#f9f5f0";
  const primaryColor = config.primary_color || "#9b6b4a";
  const headingColor = config.heading_color || "#1a1a1a";
  const bodyColor = config.body_color || "#6b7280";
  const headingWeight = config.heading_weight || "700";
  const headline = config.landing_headline || "Reduce el insomnio en la menopausia";
  const subheadline =
    config.landing_subheadline ||
    "Descubre métodos naturales y efectivos para volver a dormir bien. Accede gratis a nuestra clase exclusiva.";
  const ctaText = config.landing_cta_text || "Acceder a la Clase Gratuita";
  const extraFields = config.extra_form_fields || [];

  const containerStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    backgroundImage: config.bg_image_url ? `url(${config.bg_image_url})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100%",
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    padding: "12px 16px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    color: "#1a1a1a",
    fontFamily: "inherit",
  };

  return (
    <div style={containerStyle}>
      {/* Logo */}
      {config.logo_url && (
        <div style={{ textAlign: "center", padding: "24px 20px 0" }}>
          <img
            src={config.logo_url}
            alt="Logo"
            style={{ maxHeight: "56px", maxWidth: "200px", objectFit: "contain" }}
          />
        </div>
      )}

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 24px 64px" }}>
        {/* Hero image */}
        {config.hero_image_url && (
          <div style={{ marginBottom: "32px", borderRadius: "16px", overflow: "hidden" }}>
            <img
              src={config.hero_image_url}
              alt="Imagen principal"
              style={{ width: "100%", height: "220px", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Badge */}
        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: primaryColor,
            marginBottom: "12px",
          }}
        >
          Clase gratuita
        </p>

        {/* Headline */}
        <h1
          style={{
            fontFamily: fontOption.family,
            fontWeight: headingWeight,
            color: headingColor,
            fontSize: "clamp(26px, 5vw, 36px)",
            lineHeight: 1.2,
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          {headline}
        </h1>

        {/* Subheadline */}
        <p
          style={{
            color: bodyColor,
            fontSize: "16px",
            lineHeight: 1.65,
            marginBottom: "36px",
            textAlign: "center",
          }}
        >
          {subheadline}
        </p>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Default fields */}
          {DEFAULT_FIELDS.map((field) => (
            <div key={field.id}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: bodyColor,
                  marginBottom: "6px",
                }}
              >
                {field.label}{" "}
                {field.required && <span style={{ color: "#ef4444" }}>*</span>}
              </label>
              <input type={field.type} placeholder={field.placeholder} style={inputStyle} readOnly />
            </div>
          ))}

          {/* Extra fields */}
          {extraFields.map((field) => (
            <div key={field.id}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: bodyColor,
                  marginBottom: "6px",
                }}
              >
                {field.label || "Campo"}{" "}
                {field.required && <span style={{ color: "#ef4444" }}>*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  placeholder={field.placeholder}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  readOnly
                />
              ) : (
                <input type={field.type} placeholder={field.placeholder} style={inputStyle} readOnly />
              )}
            </div>
          ))}

          {/* Privacy checkbox */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <input
              type="checkbox"
              style={{
                marginTop: "3px",
                accentColor: primaryColor,
                width: "16px",
                height: "16px",
                flexShrink: 0,
              }}
              readOnly
            />
            <span style={{ fontSize: "12px", color: bodyColor, lineHeight: 1.55 }}>
              He leído y acepto la{" "}
              <span style={{ color: primaryColor, textDecoration: "underline" }}>Política de Privacidad</span>{" "}
              y consiento el tratamiento de mis datos personales.
            </span>
          </div>

          {/* CTA Button */}
          <button style={getButtonStyles(config)}>{ctaText}</button>

          <p style={{ fontSize: "12px", color: bodyColor, textAlign: "center", opacity: 0.7 }}>
            Tu información está segura. No compartiremos tus datos con terceros.
          </p>
        </div>
      </div>
    </div>
  );
}
