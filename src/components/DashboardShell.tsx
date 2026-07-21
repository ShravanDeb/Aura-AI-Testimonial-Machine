"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Testimonials",
    href: "/dashboard/testimonials",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    label: "Campaigns",
    href: "/dashboard/campaigns",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
];

const DEV_USER = {
  uid: "dev-user",
  email: "dev@testimonialmachine.com",
  displayName: "Dev User",
} as User;

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  useEffect(() => {
    if (!hasFirebase) {
      setUser(DEV_USER);
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, [hasFirebase, router]);

  async function handleSignOut() {
    if (hasFirebase) {
      await signOut(auth);
    }
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-small)",
          color: "var(--text-dim)",
        }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "240px",
          background: "var(--bg-subtle)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "var(--space-lg) 0",
          zIndex: 50,
        }}
      >
        <div style={{ paddingInline: "var(--space-lg)", marginBottom: "var(--space-2xl)" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-body-lg)",
              color: "var(--white)",
            }}
          >
            testimonial machine.
          </Link>
        </div>

        <nav style={{ flex: 1, paddingInline: "var(--space-sm)" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  padding: "var(--space-sm) var(--space-md)",
                  marginBottom: "2px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-small)",
                  color: isActive ? "var(--white)" : "var(--text-muted)",
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                  transition: "all 0.15s var(--ease-out)",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ paddingInline: "var(--space-lg)" }}>
          <div
            style={{
              padding: "var(--space-sm) var(--space-md)",
              borderRadius: "8px",
              background: "var(--bg-elevated)",
              marginBottom: "var(--space-sm)",
            }}
          >
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-micro)",
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              padding: "var(--space-sm) var(--space-md)",
              width: "100%",
              borderRadius: "8px",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-small)",
              color: "var(--text-muted)",
              transition: "color 0.15s var(--ease-out)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          marginLeft: "240px",
          padding: "var(--space-2xl)",
          maxWidth: "calc(100vw - 240px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
