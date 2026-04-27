"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StyleInput } from "@/components/StyleInput";
import { useSession } from "@/lib/session-context";
import type { CurationResult } from "@/lib/types";

const LOADING_MESSAGES = [
  { at: 0, text: "AI가 스타일을 분석하고 있어요..." },
  { at: 1000, text: "패션 상품을 검색하고 있어요..." },
  { at: 1500, text: "딱 맞는 아이템을 골라내고 있어요..." },
];

const RESULT_STORAGE_KEY = "styleai_last_result";

export default function HomePage() {
  const router = useRouter();
  const { profile } = useSession();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const hasProfile =
    Boolean(profile.ageGroup) ||
    Boolean(profile.bodyType) ||
    profile.preferredStyles.length > 0;

  useEffect(() => {
    if (!loading) return;
    const timers = LOADING_MESSAGES.map(({ at, text }) =>
      setTimeout(() => setLoadingMessage(text), at),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [loading]);

  async function handleSubmit(prompt: string) {
    setLoading(true);
    setLoadingMessage(LOADING_MESSAGES[0].text);

    try {
      const res = await fetch("/api/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, profile }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "요청 실패" }));
        throw new Error(error);
      }

      const result = (await res.json()) as CurationResult;
      sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
      router.push("/result");
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            AI가 찾아주는 내 스타일
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            자연어로 원하는 스타일을 입력하면 AI가 큐레이팅해드려요
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-foreground" />
            <p className="text-muted-foreground text-center">{loadingMessage}</p>
          </div>
        ) : (
          <>
            {!hasProfile && (
              <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm">
                <p className="font-medium">더 정확한 큐레이션을 받고 싶다면?</p>
                <p className="mt-1 text-muted-foreground">
                  성별/나이/체형 등 프로필을 입력하면 맞춤 추천이 가능해요.{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/profile")}
                    className="underline font-medium text-foreground"
                  >
                    프로필 설정하러 가기 →
                  </button>
                </p>
              </div>
            )}
            <StyleInput loading={loading} onSubmit={handleSubmit} />
          </>
        )}
      </div>
    </div>
  );
}
