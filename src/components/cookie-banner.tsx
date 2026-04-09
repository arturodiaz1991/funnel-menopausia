"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function CookieBanner() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return; // El admin es el titular — no necesita consentimiento
    const consent = localStorage.getItem("cookie_consent");
    if (consent !== null) return; // Ya decidido — no mostrar banner

    // Comprobar si el banner está habilitado en la configuracion
    fetch("/api/config/public")
      .then((r) => r.json())
      .then((data) => {
        // Si cookie_banner_enabled es explícitamente 'false', no mostrar
        if (data.cookie_banner_enabled === "false") return;
        setShow(true);
      })
      .catch(() => {
        setShow(true); // En caso de error, mostrar por defecto (mas seguro legalmente)
      });
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "true");
    window.dispatchEvent(new Event("cookie-consent-accepted"));
    setShow(false);
  }

  function reject() {
    localStorage.setItem("cookie_consent", "false");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-foreground/10 bg-white shadow-lg px-6 py-5">
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
          Utilizamos cookies propias y de terceros (Facebook Pixel) para analizar el trafico y mostrarte publicidad personalizada. Puedes aceptar todas las cookies o rechazar las no esenciales. Para mas informacion, consulta nuestra{" "}
          <Link
            href="/politica-cookies"
            className="text-primary underline hover:text-primary/80"
            target="_blank"
          >
            Politica de Cookies
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={accept}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Aceptar todas
          </button>
          <button
            onClick={reject}
            className="rounded-xl border border-foreground/15 px-5 py-2 text-sm font-medium text-foreground/70 hover:bg-foreground/5 transition-colors"
          >
            Solo necesarias
          </button>
        </div>
      </div>
    </div>
  );
}
