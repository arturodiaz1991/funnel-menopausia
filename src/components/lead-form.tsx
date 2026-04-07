"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LeadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefetch VSL page so navigation is instant after form submit
  useEffect(() => {
    router.prefetch("/vsl");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          utmSource: searchParams.get("utm_source"),
          utmMedium: searchParams.get("utm_medium"),
          utmCampaign: searchParams.get("utm_campaign"),
          utmContent: searchParams.get("utm_content"),
          utmTerm: searchParams.get("utm_term"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrarte");
      }

      router.push("/vsl");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground/80 mb-1.5">
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre completo"
          className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-base text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1.5">
          Correo electronico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-base text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Registrando..." : "Acceder a la Clase Gratuita"}
      </button>

      <p className="text-xs text-center text-muted">
        Tu informacion esta segura. No compartiremos tus datos con terceros.
      </p>
    </form>
  );
}
