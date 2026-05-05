"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TEMPLATES = [
  {
    name: "メール返信アシスタント",
    description: "受信したメールに対して、丁寧かつ簡潔な返信文を作成します",
    systemPrompt: `あなたはプロフェッショナルなメール返信アシスタントです。
ユーザーから受け取ったメールの内容を分析し、以下のガイドラインに従って返信文を作成してください：

1. 相手の要点に明確に答える
2. 丁寧で礼儀正しいトーンを保つ
3. 簡潔にまとめる（長くなりすぎない）
4. 必要に応じて次のアクションを提案する

返信文のみを出力してください。`,
  },
  {
    name: "議事録作成アシスタント",
    description: "会議の内容から構造化された議事録を作成します",
    systemPrompt: `あなたは議事録作成の専門家です。
ユーザーが入力した会議メモや録音テキストから、以下の形式で議事録を作成してください：

【日時】
【参加者】
【議題】
【決定事項】
【アクションアイテム】（担当者・期日付き）
【次回予定】

箇条書きを活用し、読みやすく整理してください。`,
  },
  {
    name: "文章添削アシスタント",
    description: "入力された文章の誤字・文法・表現を改善します",
    systemPrompt: `あなたはプロの文章校正者です。
ユーザーが入力した文章を以下の観点で添削してください：

1. 誤字・脱字の修正
2. 文法・語法の修正
3. 表現の改善提案
4. 全体的な読みやすさの向上

修正後の文章と、主な修正ポイントの説明を提供してください。`,
  },
];

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    systemPrompt: "",
  });

  function applyTemplate(idx: number) {
    const t = TEMPLATES[idx];
    setSelectedTemplate(idx);
    setForm({ name: t.name, description: t.description, systemPrompt: t.systemPrompt });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.systemPrompt.trim()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      setError("プロフィールが見つかりません");
      setLoading(false);
      return;
    }

    const scenarioKey = `agent_${Date.now()}`;
    const { data: scenario, error: createError } = await supabase
      .from("scenarios")
      .insert({
        tenant_id: profile.tenant_id,
        scenario_key: scenarioKey,
        display_name: form.name,
        status: "ENABLED",
        config_json: {
          name: form.name,
          description: form.description,
          systemPrompt: form.systemPrompt,
          model: "gpt-4o-mini",
        },
      })
      .select()
      .single();

    if (createError) {
      setError("エージェントの作成に失敗しました: " + createError.message);
      setLoading(false);
      return;
    }

    router.push(`/agents/${scenario.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/agents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">新しいエージェント</h1>
          <p className="text-slate-500 text-sm">エージェントを設計してAIに仕事を任せましょう</p>
        </div>
      </div>

      {/* Templates */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h2 className="font-medium text-slate-700 text-sm">テンプレートから始める</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((t, i) => (
            <button
              key={i}
              onClick={() => applyTemplate(i)}
              className={`text-left p-3 rounded-lg border text-sm transition-all ${
                selectedTemplate === i
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <p className="font-medium text-slate-800 mb-1">{t.name}</p>
              <p className="text-slate-500 text-xs line-clamp-2">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>エージェント設定</CardTitle>
            <CardDescription>エージェントの名前と動作を定義します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">{error}</div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name">エージェント名 *</Label>
              <Input
                id="name"
                placeholder="例: メール返信アシスタント"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                placeholder="このエージェントが何をするか..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="systemPrompt">
                システムプロンプト *
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  エージェントの役割・指示・制約を定義します
                </span>
              </Label>
              <Textarea
                id="systemPrompt"
                placeholder="あなたは...です。以下のガイドラインに従ってください..."
                rows={10}
                value={form.systemPrompt}
                onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                required
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Link href="/agents" className="flex-1">
                <Button variant="outline" className="w-full">キャンセル</Button>
              </Link>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !form.name.trim() || !form.systemPrompt.trim()}
              >
                {loading && <Loader2 className="animate-spin" />}
                エージェントを作成
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
