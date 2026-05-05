import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Bot, Play, Pencil, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ScenarioConfig } from "@/lib/supabase/types";

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, tenants(*)")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarded_at) redirect("/onboarding");

  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const agents = scenarios ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">エージェント</h1>
          <p className="text-slate-500 mt-1">AIエージェントを設計・管理する</p>
        </div>
        <Link href="/agents/new">
          <Button>
            <Plus />
            新しいエージェント
          </Button>
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="bg-blue-50 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <Bot className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            まだエージェントがありません
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            最初のエージェントを作成して、繰り返し作業をAIに任せましょう
          </p>
          <Link href="/agents/new">
            <Button>
              <Plus />
              最初のエージェントを作成
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const config = agent.config_json as unknown as ScenarioConfig;
            return (
              <div
                key={agent.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    {agent.is_pinned && (
                      <Pin className="h-3.5 w-3.5 text-slate-400 fill-slate-400" />
                    )}
                    <Badge
                      variant={agent.status === "ENABLED" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {agent.status === "ENABLED" ? "有効" : "無効"}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-900 mb-1">
                  {agent.display_name || config?.name || agent.scenario_key}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {config?.description || "説明なし"}
                </p>

                <div className="flex gap-2">
                  <Link href={`/agents/${agent.id}/run`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <Play className="h-3.5 w-3.5" />
                      実行
                    </Button>
                  </Link>
                  <Link href={`/agents/${agent.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
