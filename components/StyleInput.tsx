"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EXAMPLE_PROMPTS = [
  "캐주얼한 여름 데일리 룩",
  "출근룩 세미 포멀",
  "데이트 룩 페미닌 스타일",
];

interface Props {
  loading: boolean;
  onSubmit: (prompt: string) => void;
}

export function StyleInput({ loading, onSubmit }: Props) {
  const [value, setValue] = useState("");

  function trySubmit() {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    trySubmit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      trySubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="어떤 스타일의 옷을 찾고 계신가요?&#10;예) 미니멀한 봄 데일리 룩, 예산 10만원 이하&#10;&#10;(Enter로 제출 · Shift+Enter로 줄바꿈)"
        rows={5}
        className="resize-none text-base"
        disabled={loading}
      />

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((example) => (
          <Button
            key={example}
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => setValue(example)}
          >
            {example}
          </Button>
        ))}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading || value.trim().length === 0}
      >
        {loading ? "큐레이션 중..." : "큐레이션 시작"}
      </Button>
    </form>
  );
}
