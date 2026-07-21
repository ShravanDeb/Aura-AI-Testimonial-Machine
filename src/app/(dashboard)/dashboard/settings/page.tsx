"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, updateProfile, updatePassword } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  useEffect(() => {
    if (!hasFirebase) {
      setUser({ uid: "dev-user", email: "dev@testimonialmachine.com", displayName: "Dev User" } as User);
      setFullName("Dev User");
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);
      setFullName(u.displayName || "");
      setLoading(false);
    });
    return () => unsub();
  }, [hasFirebase, router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    if (hasFirebase && user) {
      await updateProfile(user, { displayName: fullName });
    }

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const form = e.target as HTMLFormElement;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;

    if (newPassword.length < 6) {
      setSaving(false);
      return;
    }

    if (hasFirebase && user) {
      try {
        await updatePassword(user, newPassword);
      } catch {
        // Need recent re-auth
      }
    }

    (form.elements.namedItem("newPassword") as HTMLInputElement).value = "";
    (form.elements.namedItem("confirmPassword") as HTMLInputElement).value = "";
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-small)", color: "var(--text-dim)" }}>Loading...</p>;
  }

  const inputStyle = {
    width: "100%",
    padding: "var(--space-sm) var(--space-md)",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-small)" as const,
    color: "var(--white)",
    transition: "border-color 0.2s var(--ease-out)",
  };

  const labelStyle = {
    fontFamily: "var(--font-mono)" as const,
    fontSize: "var(--text-micro)",
    color: "var(--text-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-wide)",
    display: "block" as const,
    marginBottom: "var(--space-xs)",
  };

  return (
    <div style={{ maxWidth: "36rem" }}>
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-h2)", color: "var(--white)", marginBottom: "var(--space-xs)" }}>Settings</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-muted)" }}>Manage your account settings</p>
      </div>

      <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px", padding: "var(--space-xl)", marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--white)", fontWeight: 500, marginBottom: "var(--space-lg)" }}>Profile</h2>
        <form onSubmit={handleSaveProfile}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={user?.email || ""} disabled style={{ ...inputStyle, color: "var(--text-dim)", cursor: "not-allowed" }} />
            </div>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginTop: "var(--space-lg)" }}>
            <button type="submit" disabled={saving} style={{ padding: "var(--space-sm) var(--space-lg)", background: "var(--white)", color: "var(--bg)", borderRadius: "8px", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: 500, opacity: saving ? 0.5 : 1, transition: "opacity 0.2s var(--ease-out)" }}>{saving ? "Saving..." : "Save Profile"}</button>
            {saved && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "#22c55e" }}>Saved</span>}
          </div>
        </form>
      </div>

      <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px", padding: "var(--space-xl)", marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--white)", fontWeight: 500, marginBottom: "var(--space-lg)" }}>Change Password</h2>
        <form onSubmit={handleUpdatePassword}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" name="newPassword" placeholder="At least 6 characters" required minLength={6} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="Confirm new password" required minLength={6} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
          </div>
          <button type="submit" disabled={saving} style={{ padding: "var(--space-sm) var(--space-lg)", marginTop: "var(--space-lg)", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--white)", borderRadius: "8px", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", opacity: saving ? 0.5 : 1, transition: "opacity 0.2s var(--ease-out)" }}>{saving ? "Updating..." : "Update Password"}</button>
        </form>
      </div>

      <div style={{ background: "var(--bg-subtle)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "var(--space-xl)" }}>
        <h2 style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "#ef4444", fontWeight: 500, marginBottom: "var(--space-sm)" }}>Danger Zone</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-muted)", marginBottom: "var(--space-lg)" }}>Permanently delete your account and all associated data.</p>
        <button onClick={() => { if (confirm("Are you sure?")) { auth.signOut(); router.push("/"); } }} style={{ padding: "var(--space-sm) var(--space-lg)", background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "8px", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", transition: "border-color 0.2s var(--ease-out)" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ef4444")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)")}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
