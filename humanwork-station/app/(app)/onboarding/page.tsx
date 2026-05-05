"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { id: "welcome", title: "ようこそ" },
  { id: "profile", title: "プロフィール設定" },
  { id: "workspace", title: "ワークスペース作成" },
  { id: "done", title: "完了" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: "",
    workspaceName: "",
    workspaceDescription: "",
  });

  async function handleComplete() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name: form.workspaceName || `${form.displayName}のワークスペース`,
        plan_tier: "STARTER",
        billing_status: "TRIAL",
      })
      .select()
      .single();

    if (tenantError) {
      setError("ワークスペースの作成に失敗しました: " + tenantError.message);
      setLoading(false);
      return;
    }

    // Upsert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        tenant_id: tenant.id,
        email: user.email!,
        display_name: form.displayName,
        role: "OWNER",
        onboarded_at: new Date().toISOString(),
      });

    if (profileError) {
      setError("プロフィールの設定に失敗しました: " + profileError.message);
      setLoading(false);
      return;
    }

    setStep(3);
    setLoading(false);
  }

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">準備完了！</h2>
          <p className="text-slate-500 mb-6">
            ワークスペースの設定が完了しました。さっそく最初のエージェントを作りましょう。
          </p>
          <Button onClick={() => router.push("/agents")} className="w-full">
            エージェントを作成する
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {steps.slice(0, 3).map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i <= step
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && <div className={`h-0.5 w-8 ${i < step ? "bg-blue-600" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 rounded-full p-3 w-fit mb-2">
                <Bot className="h-7 w-7 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">HumanWork Stationへようこそ</CardTitle>
              <CardDescription className="text-base">
                AIエージェントを設計・育成し、仕事をもっとスマートに。
                数分でセットアップできます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setStep(1)} className="w-full" size="lg">
                セットアップを始める
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>プロフィール設定</CardTitle>
              <CardDescription>あなたの情報を教えてください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">{error}</div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="displayName">表示名 *</Label>
                <Input
                  id="displayName"
                  placeholder="田中 太郎"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                  戻る
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!form.displayName.trim()}
                  className="flex-1"
                >
                  次へ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Workspace */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>ワークスペース作成</CardTitle>
              <CardDescription>チームや個人のワークスペースを作成します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">{error}</div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="workspaceName">ワークスペース名 *</Label>
                <Input
                  id="workspaceName"
                  placeholder="例: 田中事務所 / マーケティング部"
                  value={form.workspaceName}
                  onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workspaceDescription">説明（任意）</Label>
                <Textarea
                  id="workspaceDescription"
                  placeholder="ワークスペースの説明..."
                  rows={3}
                  value={form.workspaceDescription}
                  onChange={(e) => setForm({ ...form, workspaceDescription: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  戻る
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!form.workspaceName.trim() || loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="animate-spin" />}
                  完了
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
