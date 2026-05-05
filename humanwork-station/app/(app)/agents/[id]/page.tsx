import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Pencil, History, Eye, Pin, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ScenarioConfig } from "@/lib/supabase/types";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  const { data: agent } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", profile?.tenant_id ?? "")
    .single();

  if (!agent) notFound();

  const config = agent.config_json as unknown as ScenarioConfig;

  const { count: sessionCount } = await supabase
    .from("chat_sessions")
    .select("*", { count: "exact", head: true })
    .eq("scenario_id", id);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/agents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {agent.display_name || config?.name}
            </h1>
            {agent.is_pinned && <Pin className="h-4 w-4 text-slate-400 fill-slate-400" />}
            <Badge variant={agent.status === "ENABLED" ? "default" : "secondary"}>
              {agent.status === "ENABLED" ? "有効" : "無効"}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {config?.description || "説明なし"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/agents/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4" />
              編集
            </Button>
          </Link>
          <Link href={`/agents/${id}/run`}>
            <Button>
              <Play className="h-4 w-4" />
              実行
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  実行回数
                </span>
                <span className="font-semibold">{sessionCount ?? 0}回</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  作成日
                </span>
                <span className="font-medium">
                  {new Date(agent.created_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  更新日
                </span>
                <span className="font-medium">
                  {new Date(agent.updated_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Link href={`/history?agentId=${id}`}>
            <Button variant="outline" className="w-full">
              <History className="h-4 w-4" />
              実行履歴を見る
            </Button>
          </Link>
        </div>

        {/* System Prompt (US-030: Transparency) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4 text-blue-600" />
                システムプロンプト（設計思想）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-4 border">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {config?.systemPrompt || "（システムプロンプト未設定）"}
                </pre>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                このエージェントはこのシステムプロンプトに基づいて動作します
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
