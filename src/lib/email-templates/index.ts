interface EmailTemplate {
  subject: string;
  html: (name: string) => string;
}

export const emailTemplates: Record<string, EmailTemplate> = {
  welcome: {
    subject: "Tu clase gratuita te espera",
    html: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #2d2a26; font-size: 24px; margin-bottom: 16px;">Hola ${name},</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Gracias por registrarte. Tu clase gratuita sobre como reducir el insomnio en la menopausia ya esta disponible.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Haz clic en el boton para acceder ahora:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/vsl"
             style="background: #8b6f9a; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Ver mi clase gratuita
          </a>
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 40px;">
          Si no te registraste, puedes ignorar este correo.
        </p>
      </div>
    `,
  },

  abandonment_bounce: {
    subject: "No pudiste ver la clase? Te la guardamos",
    html: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #2d2a26; font-size: 24px; margin-bottom: 16px;">Hola ${name},</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Vimos que no pudiste ver la clase sobre el insomnio en la menopausia. No te preocupes, la hemos guardado para ti.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          En esta clase descubriras <strong>metodos naturales y efectivos</strong> que miles de mujeres ya estan usando para dormir mejor.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/vsl"
             style="background: #8b6f9a; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Ver la clase ahora
          </a>
        </div>
      </div>
    `,
  },

  abandonment_early: {
    subject: "Te perdiste lo mejor de la clase",
    html: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #2d2a26; font-size: 24px; margin-bottom: 16px;">Hola ${name},</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Empezaste a ver la clase pero te quedaste al principio. Lo entendemos, a veces no es el mejor momento.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Pero queriamos contarte que <strong>la parte mas valiosa viene justo despues</strong> de donde lo dejaste. Ahi es donde compartimos las 3 tecnicas que mas resultados estan dando.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/vsl"
             style="background: #8b6f9a; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Continuar viendo
          </a>
        </div>
      </div>
    `,
  },

  abandonment_middle: {
    subject: "Estabas llegando a la mejor parte...",
    html: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #2d2a26; font-size: 24px; margin-bottom: 16px;">Hola ${name},</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Vimos que estuviste viendo la clase y te quedaste a mitad. Justo cuando estaba por llegar <strong>la revelacion mas importante</strong>.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          En los proximos minutos de la clase se explica el metodo exacto que ha ayudado a cientos de mujeres a recuperar su descanso. No te lo pierdas.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/vsl"
             style="background: #8b6f9a; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Terminar de ver la clase
          </a>
        </div>
      </div>
    `,
  },

  abandonment_pre_cta: {
    subject: "Estabas tan cerca de la solucion...",
    html: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #2d2a26; font-size: 24px; margin-bottom: 16px;">Hola ${name},</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Viste casi toda la clase y estabas <strong>a punto de descubrir como acceder a la solucion completa</strong>.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Miles de mujeres ya forman parte de nuestra comunidad y estan transformando su descanso. Solo te faltaban unos minutos para ver como puedes unirte.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/vsl"
             style="background: #8b6f9a; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Ver los ultimos minutos
          </a>
        </div>
      </div>
    `,
  },

  abandonment_no_click: {
    subject: "Tu invitacion a la comunidad sigue abierta",
    html: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #2d2a26; font-size: 24px; margin-bottom: 16px;">Hola ${name},</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Viste la clase completa y sabemos que te intereso. La invitacion para unirte a la comunidad <strong>sigue abierta</strong>.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Dentro de la comunidad encontraras:
        </p>
        <ul style="color: #555; font-size: 16px; line-height: 1.8;">
          <li>Guias paso a paso para mejorar tu descanso</li>
          <li>Apoyo de otras mujeres que entienden lo que vives</li>
          <li>Acceso directo a expertos en menopausia</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.SCHOOL_COMMUNITY_URL || "https://school.com/tu-comunidad"}"
             style="background: #8b6f9a; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Unirme a la comunidad
          </a>
        </div>
      </div>
    `,
  },
};

export function getAbandonmentTemplate(abandonedAtSec: number, ctaTimestamp: number, ctaShown: boolean, ctaClicked: boolean): string | null {
  if (ctaClicked) return null; // Already converted
  if (ctaShown) return "abandonment_no_click";
  if (abandonedAtSec < 120) return "abandonment_bounce"; // 0-2 min
  if (abandonedAtSec < 480) return "abandonment_early"; // 2-8 min
  if (abandonedAtSec < 1080) return "abandonment_middle"; // 8-18 min
  if (abandonedAtSec < ctaTimestamp) return "abandonment_pre_cta"; // 18 min - CTA
  return "abandonment_no_click";
}
