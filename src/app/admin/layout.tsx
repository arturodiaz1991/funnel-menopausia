"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminContext = createContext<{ password: string }>({ password: "" });
export const useAdmin = () => useContext(AdminContext);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_password");
    if (saved) {
      setPassword(saved);
      setAuthenticated(true);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Verify password by making a test request
    const res = await fetch("/api/admin/stats", {
      headers: { "x-admin-password": inputPassword },
    });

    if (res.ok) {
      setPassword(inputPassword);
      setAuthenticated(true);
      sessionStorage.setItem("admin_password", inputPassword);
    } else {
      alert("Contraseña incorrecta");
    }
  }

  if (!authenticated) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <h1 className="text-2xl font-bold text-center">Admin</h1>
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Contraseña de admin"
            className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Acceder
          </button>
        </form>
      </main>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin/settings", label: "Configuracion" },
  ];

  return (
    <AdminContext.Provider value={{ password }}>
      <div className="flex flex-1 flex-col">
        {/* Nav */}
        <nav className="border-b border-foreground/10 bg-white">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
            <span className="text-lg font-bold text-foreground">Funnel Admin</span>
            <div className="flex gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          {children}
        </div>
      </div>
    </AdminContext.Provider>
  );
}
