import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { Activity, Award, BarChart3, Bell, BriefcaseBusiness, ClipboardCheck, FileCheck2, LayoutDashboard, LogOut } from "@/components/icons";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["STUDENT", "ACADEMICIAN", "INDUSTRY", "INSTITUTION_ADMIN", "PLATFORM_ADMIN"] },
  { href: "/opportunities", label: "Opportunities", icon: BriefcaseBusiness, roles: ["STUDENT", "ACADEMICIAN", "INDUSTRY", "INSTITUTION_ADMIN"] },
  { href: "/applications", label: "Applications", icon: ClipboardCheck, roles: ["STUDENT", "ACADEMICIAN", "INDUSTRY"] },
  { href: "/assessment", label: "Skill assessment", icon: Activity, roles: ["STUDENT"] },
  { href: "/portfolio", label: "My portfolio", icon: Award, roles: ["STUDENT", "ACADEMICIAN"] },
  { href: "/verification", label: "Verification queue", icon: FileCheck2, roles: ["INSTITUTION_ADMIN", "PLATFORM_ADMIN"] },
  { href: "/analytics", label: "Institution insights", icon: BarChart3, roles: ["INSTITUTION_ADMIN", "PLATFORM_ADMIN"] },
];

export async function Shell({ children, active = "" }: { children: React.ReactNode; active?: string }) {
  const session = await requireSession(); const user = session.user; const visibleNav = nav.filter((item) => item.roles.includes(user.role));
  const initials = user.name.split(" ").map((v) => v[0]).slice(0, 2).join("").toUpperCase();
  return <div className="app-shell"><aside className="sidebar"><Link href="/dashboard" className="brand"><span className="brand-mark">N</span><span><span className="brand-name">nexus</span><span className="brand-sub">ACADEMIA × INDUSTRY</span></span></Link><nav className="sidebar-nav" aria-label="Primary navigation"><div className="nav-label">Workspace</div>{visibleNav.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={"nav-link " + (active === item.href ? "active" : "")}><span className="nav-icon"><Icon size={16} strokeWidth={1.8} /></span><span>{item.label}</span></Link>; })}</nav><div className="sidebar-foot"><div className="role-chip">{user.role.replaceAll("_", " ")}</div><div className="user-mini"><span className="avatar">{initials}</span><span><strong>{user.name}</strong><span>{user.institution?.name || user.organisation?.name || "Nexus member"}</span></span></div><form action={logoutAction} style={{ marginTop: 12 }}><button className="nav-link" style={{ border: 0, background: "transparent", width: "100%", cursor: "pointer" }}><span className="nav-icon"><LogOut size={15} /></span><span>Sign out</span></button></form></div></aside><main className="main"><header className="topbar"><div className="breadcrumb"><span className="top-label">Nexus workspace / </span>{active.replace("/", "").replace("-", " ") || "overview"}</div><div className="topbar-actions"><Link href="/notifications" className="icon-button" aria-label="Notifications"><Bell size={18} /><span className="dot" /></Link><Link href="/profile" className="inline"><span className="avatar">{initials}</span><span className="top-label" style={{ fontSize: 12, fontWeight: 700 }}>{user.name}</span></Link></div></header>{children}</main></div>;
}
