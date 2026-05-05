import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
        <p className="text-slate-600 mb-6">ページが見つかりません</p>
        <Link href="/agents">
          <Button>ホームへ戻る</Button>
        </Link>
      </div>
    </div>
  );
}
