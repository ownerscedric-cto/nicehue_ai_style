"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/StatCard";

const MOCK_STATS = {
  totalUsers: 128,
  curationsToday: 34,
  curationsTotal: 1204,
};

const KEY_STATUS = [
  { provider: "Anthropic", registered: true, active: true },
  { provider: "OpenAI", registered: true, active: false },
  { provider: "Gemini", registered: false, active: false },
  { provider: "네이버", registered: true, active: false },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <Button asChild size="sm">
          <Link href="/admin/settings">API 키 설정으로 이동</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="총 가입자"
          value={`${MOCK_STATS.totalUsers.toLocaleString()}명`}
        />
        <StatCard
          label="오늘 큐레이션"
          value={`${MOCK_STATS.curationsToday.toLocaleString()}회`}
        />
        <StatCard
          label="누적 큐레이션"
          value={`${MOCK_STATS.curationsTotal.toLocaleString()}회`}
        />
        <StatCard
          label="AI 키 상태"
          value={
            <div className="space-y-1 text-sm font-medium">
              {KEY_STATUS.map((k) => (
                <div key={k.provider} className="flex items-center gap-2">
                  <span
                    className={
                      k.registered ? "text-emerald-500" : "text-muted-foreground"
                    }
                  >
                    ●
                  </span>
                  <span>{k.provider}</span>
                  {k.active && (
                    <span className="text-xs text-muted-foreground">
                      (사용중)
                    </span>
                  )}
                  {!k.registered && (
                    <span className="text-xs text-muted-foreground">
                      (미등록)
                    </span>
                  )}
                </div>
              ))}
            </div>
          }
        />
      </div>
    </div>
  );
}
