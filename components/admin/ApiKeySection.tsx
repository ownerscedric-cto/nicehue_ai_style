"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  provider: string;
  fieldLabel?: string;
  placeholder?: string;
  maskedValue?: string | null;
  updatedAt?: string;
}

export function ApiKeySection({
  provider,
  fieldLabel = "API Key",
  placeholder = "키를 입력하세요",
  maskedValue,
  updatedAt,
}: Props) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);

  function handleSave() {
    toast.success(`${provider} 키가 저장되었습니다.`);
    setValue("");
  }

  async function handleVerify() {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 2000));
    setVerifying(false);
    setVerifiedAt(new Date().toISOString());
    toast.success(`${provider} 키가 정상 확인되었습니다.`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{provider}</h3>
        {verifiedAt && (
          <span className="text-xs text-emerald-600">● 정상 확인됨</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${provider}-input`}>{fieldLabel}</Label>
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <Input
              id={`${provider}-input`}
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={maskedValue ?? placeholder}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "숨기기" : "보기"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSave}
            disabled={value.length === 0}
          >
            저장
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? "검증 중..." : "검증"}
          </Button>
        </div>
        {updatedAt && (
          <p className="text-xs text-muted-foreground">
            마지막 업데이트: {updatedAt}
          </p>
        )}
      </div>
    </div>
  );
}
