"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScenarioConfig } from "@/lib/supabase/types";

export default function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    status: "ENABLED",
    isPinned: false,
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("scenarios").select("*").eq("id", id).single();
      if (data) {
        const config = data.config_json as unknown as ScenarioConfig;
        setForm({
          name: data.display_name || config?.name || "",
          description: config?.description || "",
          systemPrompt: config?.systemPrompt || "",
          status: data.status,
          isPinned: data.is_pinned,
        });
      }
      setFetchLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("scenarios")
      .update({
        display_name: form.name,
        status: form.status,
        is_pinned: form.isPinned,
        config_json: {
          name: form.name,
          description: form.description,
          systemPrompt: form.systemPrompt,
          model: "gpt-4o-mini",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      setError("更新に失敗しました: " + updateError.message);
      setLoading(false);
      return;
    }

    router.push(`/agents/${id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("このエージェントを削除しますか？実行履歴も削除されます。")) return;

    setDeleteLoading(true);
    const supabase = createClient();
    await supabase.from("scenarios").delete().eq("id", id);
    router.push("/agents");
    router.refresh();
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="animate-spin h-6 w-6 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/agents/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">エージェントを編集</h1>
          <p className="text-slate-500 text-sm">設定を変更して保存してください</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={deleteLoading}
        >
          {deleteLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
          削除
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>エージェント設定</CardTitle>
            <CardDescription>変更後、保存ボタンを押してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">{error}</div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name">エージェント名 *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="systemPrompt">システムプロンプト *</Label>
              <Textarea
                id="systemPrompt"
                rows={12}
                value={form.systemPrompt}
                onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                required
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="rounded"
                  />
                  ピン留め
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.status === "ENABLED"}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.checked ? "ENABLED" : "DISABLED" })
                    }
                    className="rounded"
                  />
                  有効
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Link href={`/agents/${id}`} className="flex-1">
                <Button variant="outline" className="w-full">キャンセル</Button>
              </Link>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading && <Loader2 className="animate-spin" />}
                変更を保存
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
