export const dynamic = "force-dynamic";

import { ScrollLockProvider } from "@/lib/scroll-lock";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScrollLockProvider>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </ScrollLockProvider>
  );
}
