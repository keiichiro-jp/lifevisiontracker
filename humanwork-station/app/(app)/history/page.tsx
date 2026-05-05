import { redirect } from "next/navigation";
import Link from "next/link";
import { History, Bot, ChevronRight, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { ScenarioConfig } from "@/lib/supabase/types";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ agentId?: string }>;
}) {
  const { agentId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("chat_sessions")
    .select("*, scenarios(display_name, config_json)")
    .eq("tenant_id", profile?.tenant_id ?? "")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (agentId) {
    query = query.eq("scenario_id", agentId);
  }

  const { data: sessions } = await query;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">実行履歴</h1>
          <p className="text-slate-500 mt-1">
            {agentId ? "このエージェントの実行履歴" : "すべての実行履歴"}
          </p>
        </div>
        {agentId && (
          <Link href="/history">
            <Button variant="outline" size="sm">すべて表示</Button>
          </Link>
        )}
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="bg-slate-50 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <History className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">実行履歴がありません</h3>
          <p className="text-slate-500 text-sm mb-6">
            エージェントを実行すると、ここに履歴が表示されます
          </p>
          <Link href="/agents">
            <Button>エージェントを実行する</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => {
            const scenario = session.scenarios as { display_name: string | null; config_json: unknown } | null;
            const config = scenario?.config_json as ScenarioConfig | null;
            const agentName = scenario?.display_name || config?.name || "不明なエージェント";

            return (
              <Link
                key={session.id}
                href={`/history/${session.id}`}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:shadow-sm hover:border-blue-200 transition-all group"
              >
                <div className="bg-blue-50 rounded-lg p-2 flex-shrink-0">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {session.title || "（タイトルなし）"}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{agentName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">
                    {new Date(session.updated_at).toLocaleDateString("ja-JP")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(session.updated_at).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
