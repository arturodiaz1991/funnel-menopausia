import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de Cookies",
  robots: { index: false },
};

export default function PoliticaCookiesPage() {
  const siteName = "Clase Gratuita: Reduce el Insomnio en la Menopausia";
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://funnel-menopausia-app.vercel.app";
  const contactEmail = "info@tudominio.com";
  const lastUpdated = "9 de abril de 2026";

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-primary hover:underline">
            &larr; Volver a la pagina principal
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Politica de Cookies</h1>
        <p className="text-sm text-muted mb-8">Ultima actualizacion: {lastUpdated}</p>

        <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. ¿Que son las cookies?</h2>
            <p>
              Las cookies son pequenos archivos de texto que se almacenan en tu dispositivo (ordenador, tablet o movil) cuando visitas un sitio web. Permiten que el sitio recuerde informacion sobre tu visita, como tus preferencias de idioma o si ya has aceptado nuestra politica de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. ¿Quien es el responsable?</h2>
            <p>
              El responsable del tratamiento de datos asociados al uso de cookies en <strong>{siteUrl}</strong> es el titular del sitio web. Para cualquier consulta, puedes contactar en: <a href={`mailto:${contactEmail}`} className="text-primary underline">{contactEmail}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Tipos de cookies que utilizamos</h2>

            <div className="space-y-4">
              <div className="rounded-xl border border-foreground/10 bg-white p-4">
                <h3 className="font-semibold text-foreground mb-1">Cookies tecnicas o esenciales</h3>
                <p className="text-xs text-muted mb-2">Base legal: Interes legitimo (Art. 6.1.f RGPD) — No requieren consentimiento</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left border-b border-foreground/5">
                      <th className="pb-1 font-medium">Nombre</th>
                      <th className="pb-1 font-medium">Finalidad</th>
                      <th className="pb-1 font-medium">Duracion</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    <tr className="border-b border-foreground/5">
                      <td className="py-1 font-mono">lead_token</td>
                      <td className="py-1">Identificar al usuario registrado para la sesion de video</td>
                      <td className="py-1">7 dias</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-mono">cookie_consent</td>
                      <td className="py-1">Recordar tu eleccion sobre el consentimiento de cookies</td>
                      <td className="py-1">1 ano (localStorage)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-foreground/10 bg-white p-4">
                <h3 className="font-semibold text-foreground mb-1">Cookies de terceros — Analisis y publicidad (Facebook Pixel)</h3>
                <p className="text-xs text-muted mb-2">Base legal: Consentimiento (Art. 6.1.a RGPD) — Requieren tu aceptacion</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left border-b border-foreground/5">
                      <th className="pb-1 font-medium">Proveedor</th>
                      <th className="pb-1 font-medium">Finalidad</th>
                      <th className="pb-1 font-medium">Mas informacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1">Meta Platforms Ireland Ltd.</td>
                      <td className="py-1">Medir la efectividad de anuncios publicitarios en Facebook e Instagram y mostrarte anuncios relevantes</td>
                      <td className="py-1">
                        <a
                          href="https://www.facebook.com/privacy/policies/cookies/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Politica de privacidad de Meta
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-muted mt-2">
                  Meta puede transferir datos a EE.UU. bajo las garantias de las Clausulas Contractuales Tipo de la UE. Para mas detalles, consulta su politica de privacidad.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Como gestionar o retirar tu consentimiento</h2>
            <p className="mb-3">
              Puedes retirar tu consentimiento en cualquier momento. Para ello, borra las cookies de tu navegador y recarga la pagina: volvera a aparecer el banner para que elijas de nuevo.
            </p>
            <p className="mb-3">
              Tambien puedes gestionar las cookies directamente desde la configuracion de tu navegador:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-primary underline">Microsoft Edge</a></li>
            </ul>
            <p className="mt-3 text-muted">
              Ten en cuenta que deshabilitar ciertas cookies puede afectar al funcionamiento del sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Actualizaciones de esta politica</h2>
            <p>
              Esta politica puede actualizarse para reflejar cambios en las cookies que utilizamos. Te recomendamos revisarla periodicamente. La fecha de la ultima actualizacion aparece al inicio del documento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Contacto y reclamaciones</h2>
            <p className="mb-2">
              Para cualquier consulta sobre el uso de cookies, puedes escribirnos a: <a href={`mailto:${contactEmail}`} className="text-primary underline">{contactEmail}</a>
            </p>
            <p>
              Si consideras que el tratamiento de tus datos no es conforme a la normativa, tienes derecho a presentar una reclamacion ante la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary underline">Agencia Espanola de Proteccion de Datos (AEPD)</a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
