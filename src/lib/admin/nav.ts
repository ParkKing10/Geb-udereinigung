import {
  LayoutDashboard, CalendarCheck, Inbox, KanbanSquare, Mail, Megaphone, ReceiptText, Wallet, Calculator, Newspaper, MonitorSmartphone, Settings, CircleUser,
} from "lucide-react";
import type { ComponentType } from "react";

export type NavItem = { label: string; href: string; icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }> };

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Aufträge", href: "/admin/auftraege", icon: CalendarCheck },
  { label: "Leads", href: "/admin/leads", icon: Inbox },
  { label: "CRM", href: "/admin/crm", icon: KanbanSquare },
  { label: "E-Mails", href: "/admin/email", icon: Mail },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "Invoices", href: "/admin/invoices", icon: ReceiptText },
  { label: "Finance", href: "/admin/finance", icon: Wallet },
  { label: "Betriebskosten", href: "/admin/betriebskosten", icon: Calculator },
  { label: "Blog Management", href: "/admin/blog", icon: Newspaper },
  { label: "Website", href: "/admin/website", icon: MonitorSmartphone },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Profile", href: "/admin/profile", icon: CircleUser },
];
