"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AIModel } from "@/lib/types";

const STORAGE_KEY = "styleai_active_model";

const MODELS: { value: AIModel; label: string }[] = [
  { value: "anthropic", label: "Anthropic Claude" },
  { value: "openai", label: "OpenAI GPT" },
  { value: "gemini", label: "Google Gemini" },
];

export function ModelSelector() {
  const [model, setModel] = useState<AIModel>("anthropic");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && MODELS.some((m) => m.value === stored)) {
      setModel(stored as AIModel);
    }
    setHydrated(true);
  }, []);

  function handleChange(value: string) {
    const next = value as AIModel;
    setModel(next);
    localStorage.setItem(STORAGE_KEY, next);
    toast.success(`${MODELS.find((m) => m.value === next)?.label}(으)로 변경되었습니다.`);
  }

  if (!hydrated) {
    return <div className="h-20" aria-hidden />;
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">현재 사용 모델</Label>
      <RadioGroup
        value={model}
        onValueChange={handleChange}
        className="flex flex-wrap gap-4"
      >
        {MODELS.map((m) => (
          <label
            key={m.value}
            className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 hover:bg-accent"
          >
            <RadioGroupItem value={m.value} id={`model-${m.value}`} />
            <span className="text-sm font-medium">{m.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
