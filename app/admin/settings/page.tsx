"use client";

import { ApiKeySection } from "@/components/admin/ApiKeySection";
import { ModelSelector } from "@/components/admin/ModelSelector";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">API 키 설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI 모델을 선택하고 각 서비스의 API 키를 관리합니다.
        </p>
      </div>

      <section className="rounded-lg border bg-background p-6">
        <h2 className="mb-4 text-lg font-semibold">AI 모델</h2>
        <ModelSelector />
      </section>

      <Separator />

      <div className="space-y-6">
        <section className="rounded-lg border bg-background p-6">
          <ApiKeySection
            provider="Anthropic"
            maskedValue="sk-ant-••••••••••••••••xQ3A"
            updatedAt="2026-04-23 14:32"
          />
        </section>

        <section className="rounded-lg border bg-background p-6">
          <ApiKeySection
            provider="OpenAI"
            maskedValue="sk-proj-••••••••••••mN2K"
            updatedAt="2026-04-23 14:32"
          />
        </section>

        <section className="rounded-lg border bg-background p-6">
          <ApiKeySection provider="Google Gemini" placeholder="(미등록)" />
        </section>

        <section className="space-y-4 rounded-lg border bg-background p-6">
          <ApiKeySection
            provider="네이버 쇼핑"
            fieldLabel="Client ID"
            maskedValue="AbCd••••••••••••"
            updatedAt="2026-04-23 14:32"
          />
          <Separator />
          <ApiKeySection
            provider="네이버 쇼핑"
            fieldLabel="Client Secret"
            maskedValue="XyZw••••••••"
          />
        </section>
      </div>

      <p className="rounded-md bg-muted p-4 text-xs text-muted-foreground">
        ※ 데모 버전입니다. 입력한 키는 실제로 저장되지 않으며, 저장/검증 버튼은 UI
        시뮬레이션만 수행합니다.
      </p>
    </div>
  );
}
