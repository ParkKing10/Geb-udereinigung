"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Menu, X, LogOut, ExternalLink } from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin/nav";

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminShell({
  children,
  user,
  allowedHrefs,
}: {
  children: React.ReactNode;
  user: { name: string; role: string; initials: string; avatar?: string };
  allowedHrefs?: string[]; // vom Server-Layout nach Benutzer-Rechten gefiltert
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const nav = allowedHrefs ? ADMIN_NAV.filter((n) => allowedHrefs.includes(n.href)) : ADMIN_NAV;
  const current = nav.find((n) => isActive(pathname, n.href));

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Mobile-Overlay */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#16241a] text-neutral-300 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid size-9 place-items-center rounded-lg bg-[#5d8a34] text-xs font-black text-white">DGD</span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-white">Deutsche Gebäudedienste</span>
              <span className="block text-[11px] text-neutral-400">Admin-Bereich</span>
            </span>
          </Link>
          <button className="text-neutral-400 lg:hidden" onClick={() => setOpen(false)} aria-label="Menü schließen">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
                }`}
              >
                <span className={active ? "text-[#8fbf5f]" : "text-neutral-500 group-hover:text-neutral-300"}>
                  <Icon size={18} strokeWidth={2} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-white/5 hover:text-neutral-100">
            <ExternalLink size={17} /> Zur Website
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-white/5 hover:text-neutral-100">
            <LogOut size={17} /> Abmelden
          </button>
        </div>
      </aside>

      {/* Hauptbereich */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button className="text-neutral-600 lg:hidden" onClick={() => setOpen(true)} aria-label="Menü öffnen">
            <Menu size={22} />
          </button>
          <div className="hidden text-sm font-semibold text-neutral-800 sm:block">{current?.label ?? "Admin"}</div>
          <div className="relative ml-auto hidden max-w-xs flex-1 sm:block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Suchen …"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus:border-[#5d8a34] focus:bg-white"
            />
          </div>
          <button className="relative ml-auto grid size-9 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 sm:ml-0" aria-label="Benachrichtigungen">
            <Bell size={19} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[#5d8a34] ring-2 ring-white" />
          </button>
          <div className="flex items-center gap-2.5">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="size-9 rounded-full object-cover" />
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-[#16241a] text-xs font-bold text-white">{user.initials}</span>
            )}
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold text-neutral-900">{user.name}</span>
              <span className="block text-xs text-neutral-500">{user.role}</span>
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
