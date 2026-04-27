import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="text-muted-foreground">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있어요.
      </p>
      <Button asChild>
        <Link href="/">홈으로</Link>
      </Button>
    </div>
  );
}
