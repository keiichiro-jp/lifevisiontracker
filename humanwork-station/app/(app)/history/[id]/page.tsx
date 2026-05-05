import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot, User, Play, Pencil, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScenarioConfig } from "@/lib/supabase/types";

export default async function HistoryDetailPage({
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

  const { data: session } = await supabase
    .from("chat_sessions")
    .select("*, scenarios(id, display_name, config_json)")
    .eq("id", id)
    .eq("tenant_id", profile?.tenant_id ?? "")
    .single();

  if (!session) notFound();

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  const scenario = session.scenarios as { id: string; display_name: string | null; config_json: unknown } | null;
  const config = scenario?.config_json as ScenarioConfig | null;
  const agentName = scenario?.display_name || config?.name || "エージェント";

  // Find the last user message for the "improve from history" flow (US-023)
  const userMessages = (messages ?? []).filter((m) => m.role === "user");
  const lastUserMessage = userMessages[userMessages.length - 1]?.content ?? "";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 h-14 border-b bg-white flex-shrink-0">
        <Link href="/history">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate">{session.title || "実行履歴"}</p>
          <p className="text-xs text-slate-500">{agentName}</p>
        </div>
        {scenario?.id && (
          <div className="flex gap-2">
            {/* US-023: Improve agent from execution history */}
            <Link href={`/agents/${scenario.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-3.5 w-3.5" />
                エージェントを改善
              </Button>
            </Link>
            {/* Continue the conversation */}
            <Link href={`/agents/${scenario.id}/run`}>
              <Button size="sm">
                <Play className="h-3.5 w-3.5" />
                再実行
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-slate-50">
        {/* Session info banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-500 flex items-center justify-between">
          <span>
            実行日時:{" "}
            {new Date(session.created_at).toLocaleString("ja-JP")}
          </span>
          <span>{(messages ?? []).length} メッセージ</span>
        </div>

        {(messages ?? []).map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
          >
            <div
              className={cn(
                "rounded-full p-2 flex-shrink-0 self-start",
                msg.role === "user" ? "bg-slate-100" : "bg-blue-50"
              )}
            >
              {msg.role === "user" ? (
                <User className="h-4 w-4 text-slate-600" />
              ) : (
                <Bot className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-800"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Improve CTA (US-023) */}
      {scenario?.id && (
        <div className="border-t bg-white px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-amber-900">この実行結果を元に改善できます</p>
              <p className="text-xs text-amber-700">
                エージェントのシステムプロンプトを編集して、より良い結果を目指しましょう
              </p>
            </div>
            <Link href={`/agents/${scenario.id}/edit`}>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white ml-4">
                改善する
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
