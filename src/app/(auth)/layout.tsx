export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingInline: "var(--side-padding)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "24rem" }}>{children}</div>
    </div>
  );
}
