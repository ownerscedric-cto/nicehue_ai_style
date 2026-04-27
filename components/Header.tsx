"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session-context";

export function Header() {
  const router = useRouter();
  const { user, isAdmin, hydrated, logout } = useSession();

  function handleLogout() {
    logout();
    toast.success("로그아웃되었습니다.");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          StyleAI
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {!hydrated ? (
            <div className="h-9 w-40" aria-hidden />
          ) : user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">어드민</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">
                  <span className="hidden sm:inline">프로필</span>
                  <span className="sm:hidden">프로필</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/wishlist">
                  <span className="hidden sm:inline">찜 목록</span>
                  <span className="sm:hidden">찜</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
