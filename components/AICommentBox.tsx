import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  comment: string;
  keywords: string[];
}

export function AICommentBox({ comment, keywords }: Props) {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-violet-50 to-blue-50 p-5 dark:from-violet-950/30 dark:to-blue-950/30">
      <div className="flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
        <Sparkles className="h-4 w-4" />
        AI 큐레이터 분석
      </div>
      <p className="mt-3 text-base leading-relaxed text-foreground">
        {comment}
      </p>
      {keywords.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {keywords.map((kw) => (
            <Badge
              key={kw}
              variant="outline"
              className="bg-background/60 backdrop-blur"
            >
              #{kw}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
