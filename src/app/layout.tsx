import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import FacebookPixel from "@/components/facebook-pixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clase Gratuita: Reduce el Insomnio en la Menopausia",
  description: "Descubre como reducir los efectos del insomnio durante la menopausia con metodos naturales y efectivos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <FacebookPixel />
        {children}
      </body>
    </html>
  );
}
