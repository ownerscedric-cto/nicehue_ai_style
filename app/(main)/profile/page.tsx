"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/lib/session-context";
import type { AgeGroup, BodyType, UserProfile } from "@/lib/types";

const STYLE_OPTIONS = [
  { value: "minimal", label: "미니멀" },
  { value: "casual", label: "캐주얼" },
  { value: "formal", label: "포멀" },
  { value: "street", label: "스트릿" },
  { value: "feminine", label: "페미닌" },
  { value: "vintage", label: "빈티지" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { profile, saveProfile, hydrated } = useSession();
  const [draft, setDraft] = useState<UserProfile>({ preferredStyles: [] });

  useEffect(() => {
    if (hydrated) setDraft(profile);
  }, [hydrated, profile]);

  function toggleStyle(value: string) {
    setDraft((prev) => {
      const exists = prev.preferredStyles.includes(value);
      return {
        ...prev,
        preferredStyles: exists
          ? prev.preferredStyles.filter((s) => s !== value)
          : [...prev.preferredStyles, value],
      };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveProfile(draft);
    toast.success("프로필이 저장되었습니다.");
    router.push("/");
  }

  function handleClear() {
    const empty: UserProfile = { preferredStyles: [] };
    setDraft(empty);
    saveProfile(empty);
    toast.success("프로필이 초기화되었습니다.");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <Card>
        <CardHeader>
          <CardTitle>프로필 설정</CardTitle>
          <CardDescription>
            정보를 입력하면 더 정확한 큐레이션을 받을 수 있어요. 모든 항목은
            선택 사항입니다.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">나이대</Label>
              <RadioGroup
                value={draft.ageGroup ?? ""}
                onValueChange={(v) =>
                  setDraft({ ...draft, ageGroup: (v as AgeGroup) || undefined })
                }
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {[
                  { value: "20s", label: "20대" },
                  { value: "30s", label: "30대" },
                  { value: "40s", label: "40대" },
                  { value: "50plus", label: "50대+" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 hover:bg-accent"
                  >
                    <RadioGroupItem value={opt.value} />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">체형</Label>
              <RadioGroup
                value={draft.bodyType ?? ""}
                onValueChange={(v) =>
                  setDraft({ ...draft, bodyType: (v as BodyType) || undefined })
                }
                className="grid grid-cols-3 gap-2"
              >
                {[
                  { value: "slim", label: "슬림" },
                  { value: "average", label: "보통" },
                  { value: "robust", label: "통통" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 hover:bg-accent"
                  >
                    <RadioGroupItem value={opt.value} />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium">
                키 (cm)
              </Label>
              <Input
                id="height"
                type="number"
                min={100}
                max={250}
                placeholder="예) 175"
                value={draft.height ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setDraft({
                    ...draft,
                    height: val ? parseInt(val, 10) : undefined,
                  });
                }}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">선호 스타일 (다중 선택)</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((opt) => {
                  const selected = draft.preferredStyles.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleStyle(opt.value)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                저장하기
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                초기화
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
