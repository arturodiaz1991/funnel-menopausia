import { Resend } from "resend";
import { config } from "./config";

const resend = new Resend(config.resendApiKey);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<string | null> {
  if (!config.resendApiKey || config.resendApiKey === "re_test_placeholder") {
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
    return "mock_email_id";
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Clase Menopausia <noreply@tudominio.com>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}
