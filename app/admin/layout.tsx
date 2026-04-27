"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, hydrated } = useSession();

  useEffect(() => {
    if (hydrated && !isAdmin) {
      router.replace("/");
    }
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) {
    return null;
  }

  const tabs = [
    { href: "/admin", label: "대시보드" },
    { href: "/admin/settings", label: "API 키 설정" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold">어드민</span>
            <span className="text-sm text-muted-foreground">StyleAI</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">서비스로 돌아가기</Link>
          </Button>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-1 px-4 sm:px-6">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
