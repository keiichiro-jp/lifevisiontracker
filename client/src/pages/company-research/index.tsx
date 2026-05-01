import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Search, Clock, ChevronRight, Download, ArrowLeft,
  RefreshCw, CheckCircle2, Sparkles, BarChart3, Users, Globe,
  FileText, LayoutGrid, List, Bot, X, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateCompanyPDF } from "@/lib/companyPdf";

// ---- Types ----
type Department = {
  name: string;
  description: string;
  subDepartments?: Department[];
  roles?: string[];
};
type BusinessActivity = {
  name: string;
  department: string;
  description: string;
  sourceUrl?: string;
  sourceType: string;
};
type AIAgentSuggestion = {
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  department: string;
};
type Competitor = { name: string; reason: string; industry: string };
type Source = { type: string; description: string; url: string };
type ResearchRecord = {
  id: number;
  companyName: string;
  industryTag: string | null;
  organizationStructure: Department;
  businessActivities: BusinessActivity[];
  aiAgentSuggestions: AIAgentSuggestion[] | null;
  competitors: Competitor[];
  summary: string | null;
  sources: Source[];
  createdAt: string;
};

// ---- Loading steps ----
const LOADING_STEPS = [
  { phase: 1, label: "組織形態・規模・事業セグメントを事前調査中...", icon: "🌐", ms: 1800 },
  { phase: 2, label: "公式サイト・IR資料・統合報告書を解析中...", icon: "📄", ms: 2200 },
  { phase: 2, label: "求人票（Indeed/LinkedIn/Wantedly等）から部門名・職種を収集中...", icon: "🔍", ms: 2500 },
  { phase: 2, label: "OpenWork・Glassdoor・業界メディアを調査中...", icon: "👥", ms: 2000 },
  { phase: 3, label: "組織タイプ・網羅性・部門名の正確性を自動チェック中...", icon: "🛡️", ms: 2000 },
  { phase: 3, label: "抜け漏れ部門を補完・業務内容を具体化・最適化中...", icon: "🔄", ms: 0 },
];

const PHASE_LABELS = ["組織タイプ判定", "広範囲詳細調査", "品質レビュー・補完"];

type View = "home" | "loading" | "results";

// ---- Priority styles ----
const PRIORITY_STYLES = {
  high: { label: "優先度：高", titleColor: "text-red-600", bg: "bg-red-50 border-red-100", badge: "bg-red-100 text-red-700" },
  medium: { label: "優先度：中", titleColor: "text-amber-600", bg: "bg-amber-50 border-amber-100", badge: "bg-amber-100 text-amber-700" },
  low: { label: "優先度：低", titleColor: "text-green-600", bg: "bg-green-50 border-green-100", badge: "bg-green-100 text-green-700" },
};

// ---- Helpers ----
function countRoles(dept: Department): number {
  const own = dept.roles?.length ?? 0;
  const sub = (dept.subDepartments ?? []).reduce((s, d) => s + countRoles(d), 0);
  return own + sub;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

// ============================================================
// Home view
// ============================================================
function HomeView({
  onSearch, history, onSelectHistory, onDeleteHistory, historyLoading,
}: {
  onSearch: (name: string) => void;
  history: ResearchRecord[];
  onSelectHistory: (r: ResearchRecord) => void;
  onDeleteHistory: (id: number) => void;
  historyLoading: boolean;
}) {
  const [input, setInput] = useState("");

  const features = [
    { icon: <Building2 size={20} className="text-blue-600" />, title: "組織体系の可視化", desc: "部門・チーム構造を階層的にマッピング" },
    { icon: <BarChart3 size={20} className="text-blue-600" />, title: "全業務内容の抽出", desc: "求人情報も活用し網羅的に業務を特定" },
    { icon: <Sparkles size={20} className="text-blue-600" />, title: "AIエージェント提案", desc: "自動化・AI化できる業務領域を提案" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F3F9]">
      {/* Navbar */}
      <nav className="bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">OrgIntel</span>
        </div>
        <button
          onClick={() => {}}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Clock size={15} />
          調査履歴
        </button>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center pt-16 pb-12 px-4 text-center">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Sparkles size={12} />
          AI駆動の企業組織・業務調査
        </span>
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
          会社名を入力するだけで
        </h1>
        <h1 className="text-4xl font-extrabold text-blue-600 leading-tight mb-5">
          組織と業務を丸ごと調査
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">
          公式サイト・求人情報・IR資料・ニュースリリースなど<br />
          複数ソースをAIが横断調査し、構造化レポートを生成します。
        </p>

        {/* Search bar */}
        <div className="flex gap-2 w-full max-w-xl bg-white rounded-2xl shadow-sm p-1.5 border border-gray-100">
          <div className="flex items-center flex-1 px-3 gap-2">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              className="flex-1 text-sm outline-none placeholder:text-gray-400"
              placeholder="例: トヨタ自動車、Sony、楽天グループ..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && input.trim() && onSearch(input.trim())}
            />
          </div>
          <Button
            onClick={() => input.trim() && onSearch(input.trim())}
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2 text-sm font-medium gap-1"
          >
            調査開始 <ChevronRight size={15} />
          </Button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-4 mb-12">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
              {f.icon}
            </div>
            <p className="font-semibold text-gray-800 text-sm mb-1">{f.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Recent searches */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <p className="text-sm font-semibold text-gray-500 mb-3">最近の調査</p>
        {historyLoading && <p className="text-sm text-gray-400">読み込み中...</p>}
        {!historyLoading && history.length === 0 && (
          <p className="text-sm text-gray-400">まだ調査履歴がありません</p>
        )}
        <div className="space-y-2">
          {history.slice(0, 5).map(rec => (
            <div
              key={rec.id}
              className="group bg-white rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:shadow-sm transition border border-gray-100"
              onClick={() => onSelectHistory(rec)}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{rec.companyName}</p>
                  {rec.industryTag && <p className="text-xs text-gray-400">{rec.industryTag}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{formatDate(rec.createdAt)}</span>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteHistory(rec.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                </button>
                <ChevronRight size={15} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Loading view
// ============================================================
function LoadingView({ companyName }: { companyName: string }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setCurrentStep(-1);

    let elapsed = 500;
    LOADING_STEPS.forEach((step, i) => {
      if (step.ms === 0) return; // last step waits for API
      const t = setTimeout(() => setCurrentStep(i), elapsed);
      timersRef.current.push(t);
      elapsed += step.ms;
    });

    return () => timersRef.current.forEach(clearTimeout);
  }, [companyName]);

  const currentPhase = currentStep >= 0 ? LOADING_STEPS[currentStep].phase : 1;

  return (
    <div className="min-h-screen bg-[#F1F3F9]">
      <div className="max-w-xl mx-auto pt-8 px-4">
        {/* Back bar */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
            <ArrowLeft size={15} className="text-gray-500" />
          </div>
          <span className="text-sm font-medium text-gray-700">{companyName}</span>
        </div>

        {/* Spinner */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            「{companyName}」を調査中
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-sm">
            複数ソースの横断調査 → AIによる自動品質チェックの2段階プロセスで精度を高めています。<br />
            2〜3分ほどお待ちください。
          </p>

          {/* Phase steps */}
          <div className="flex items-center gap-3 mb-8">
            {PHASE_LABELS.map((label, i) => {
              const phase = i + 1;
              const done = currentPhase > phase;
              const active = currentPhase === phase;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {done ? <CheckCircle2 size={14} /> : phase}
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  {i < PHASE_LABELS.length - 1 && (
                    <div className={`w-12 h-0.5 mb-4 rounded ${currentPhase > phase ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step list */}
          <div className="w-full space-y-2">
            {LOADING_STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              if (i > currentStep + 1) return null;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${active ? "bg-blue-50 border border-blue-100" : done ? "bg-white border border-gray-100" : "bg-white border border-gray-50 opacity-60"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-base shrink-0 ${active ? "bg-blue-600" : "bg-white"}`}>
                    {active ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>{step.icon}</span>
                    )}
                  </div>
                  <span className={`flex-1 text-left ${active ? "text-blue-700 font-medium" : "text-gray-600"}`}>
                    {step.label}
                  </span>
                  {done && <span className="text-green-600 text-xs font-medium">完了</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Org dept card
// ============================================================
function DeptCard({ dept }: { dept: Department }) {
  const [open, setOpen] = useState(false);
  const subCount = dept.subDepartments?.length ?? 0;
  const roleCount = countRoles(dept);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-4 flex items-start justify-between hover:bg-gray-50 transition"
      >
        <div className="flex-1">
          <p className="text-blue-600 font-semibold text-sm mb-1">{dept.name}</p>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{dept.description}</p>
          <div className="flex gap-2 mt-2">
            {subCount > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{subCount}部署</span>
            )}
            {roleCount > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{roleCount}職種</span>
            )}
          </div>
        </div>
        <ChevronRight size={15} className={`text-gray-400 mt-0.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (dept.subDepartments?.length || dept.roles?.length) ? (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50">
          {dept.roles && dept.roles.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {dept.roles.map((r, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{r}</span>
              ))}
            </div>
          )}
          {dept.subDepartments?.map((sub, i) => (
            <div key={i} className="bg-white rounded-lg px-3 py-2 border border-gray-100">
              <p className="text-sm font-medium text-gray-800">{sub.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{sub.description}</p>
              {sub.roles && sub.roles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {sub.roles.map((r, j) => (
                    <span key={j} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{r}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ============================================================
// Results view
// ============================================================
function ResultsView({
  record,
  onBack,
  onResearchCompetitor,
  researchPending,
}: {
  record: ResearchRecord;
  onBack: () => void;
  onResearchCompetitor: (name: string) => void;
  researchPending: boolean;
}) {
  const [orgView, setOrgView] = useState<"tree" | "list">("tree");
  const { toast } = useToast();

  const topDepts = record.organizationStructure.subDepartments ?? [];
  const deptCount = topDepts.length;
  const roleCount = topDepts.reduce((s, d) => s + countRoles(d), 0);
  const deptSet = new Set(record.businessActivities.map(a => a.department));
  const activityCategories = deptSet.size;
  const aiCount = record.aiAgentSuggestions?.length ?? 0;

  const handleExport = () => {
    try {
      generateCompanyPDF(record as any);
      toast({ title: "PDFをダウンロードしました" });
    } catch {
      toast({ title: "PDFエラー", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F9]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <button onClick={onBack} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition shrink-0">
          <ArrowLeft size={15} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{record.companyName}</p>
          {record.industryTag && <p className="text-xs text-gray-500 truncate">{record.industryTag}</p>}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          className="gap-1.5 shrink-0 text-xs"
        >
          <Download size={13} /> エクスポート
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Company info card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-gray-900">{record.companyName}</h2>
              </div>
              {record.industryTag && (
                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                  {record.industryTag}
                </span>
              )}
            </div>
          </div>

          {record.summary && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{record.summary}</p>
          )}

          {record.sources.length > 0 && (
            <div className="flex items-start gap-2 mb-4">
              <Globe size={13} className="text-gray-400 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-gray-500 font-medium">調査ソース</span>
                {record.sources.map((s, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.description}</span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 divide-x divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {[
              { icon: <LayoutGrid size={16} className="text-blue-500" />, value: deptCount, label: "部門数" },
              { icon: <FileText size={16} className="text-blue-500" />, value: activityCategories, label: "業務カテゴリ" },
              { icon: <Users size={16} className="text-blue-500" />, value: roleCount, label: "主要職種" },
              { icon: <Bot size={16} className="text-blue-500" />, value: aiCount, label: "AI活用提案" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center py-3 gap-1">
                {s.icon}
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Organization section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <LayoutGrid size={15} className="text-blue-600" />
              <span className="font-semibold text-gray-800 text-sm">組織体系</span>
              <span className="text-xs text-gray-400">{deptCount}部門</span>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setOrgView("tree")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${orgView === "tree" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}
              >
                ツリー
              </button>
              <button
                onClick={() => setOrgView("list")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${orgView === "list" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}
              >
                リスト
              </button>
            </div>
          </div>

          {/* Org root header */}
          <div className="bg-[#1E293B] text-white px-5 py-3 flex items-center gap-3">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">{record.organizationStructure.name}</p>
              <p className="text-xs text-white/60">{deptCount}部門 / 組織全体</p>
            </div>
          </div>

          <div className="p-4">
            {orgView === "tree" ? (
              <div className="grid grid-cols-2 gap-3">
                {topDepts.map((dept, i) => <DeptCard key={i} dept={dept} />)}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {topDepts.map((dept, i) => (
                  <div key={i} className="py-3">
                    <p className="font-semibold text-sm text-gray-800">{dept.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{dept.description}</p>
                    {dept.subDepartments?.map((sub, j) => (
                      <div key={j} className="ml-4 mt-1.5 border-l-2 border-blue-100 pl-3">
                        <p className="text-sm text-gray-700">{sub.name}</p>
                        {sub.roles && <p className="text-xs text-gray-400">{sub.roles.join(" · ")}</p>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Business activities */}
        {record.businessActivities.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <FileText size={15} className="text-blue-600" />
              <span className="font-semibold text-gray-800 text-sm">全業務内容</span>
              <span className="text-xs text-gray-400">{record.businessActivities.length}件</span>
            </div>
            <div className="divide-y divide-gray-50">
              {record.businessActivities.map((act, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-gray-800">{act.name}</p>
                  </div>
                  <p className="text-xs text-blue-600 mb-0.5">{act.department}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{act.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Agent suggestions */}
        {record.aiAgentSuggestions && record.aiAgentSuggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Bot size={15} className="text-blue-600" />
              <span className="font-semibold text-gray-800 text-sm">AIエージェント活用提案</span>
            </div>
            {record.aiAgentSuggestions.map((sug, i) => {
              const style = PRIORITY_STYLES[sug.priority] ?? PRIORITY_STYLES.medium;
              return (
                <div key={i} className={`rounded-xl p-4 border ${style.bg}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className={`font-semibold text-sm ${style.titleColor}`}>{sug.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{sug.description}</p>
                  <p className="text-xs text-gray-400 mt-1.5">対象部署: {sug.department}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Competitors */}
        {record.competitors.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-semibold text-gray-800 text-sm">競合企業トップ{record.competitors.length}</span>
              <button
                onClick={() => onResearchCompetitor(record.competitors[0].name)}
                disabled={researchPending}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <RefreshCw size={12} /> 再取得
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {record.competitors.map((comp, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-gray-600">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{comp.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{comp.reason}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResearchCompetitor(comp.name)}
                    disabled={researchPending}
                    className="shrink-0 text-xs gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    調査する <ChevronRight size={13} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}

// ============================================================
// Main page
// ============================================================
export default function CompanyResearchPage() {
  const [view, setView] = useState<View>("home");
  const [pendingCompany, setPendingCompany] = useState("");
  const [activeRecord, setActiveRecord] = useState<ResearchRecord | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: history = [], isLoading: historyLoading } = useQuery<ResearchRecord[]>({
    queryKey: ["/api/company-research"],
    queryFn: async () => {
      const res = await fetch("/api/company-research");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const researchMutation = useMutation({
    mutationFn: async (companyName: string) => {
      const res = await fetch("/api/company-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || "Research failed");
      }
      return res.json() as Promise<ResearchRecord>;
    },
    onSuccess: record => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-research"] });
      setActiveRecord(record);
      setView("results");
      toast({ title: "調査完了", description: `${record.companyName}の調査が完了しました` });
    },
    onError: (err: Error) => {
      setView("home");
      toast({ title: "エラー", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/company-research/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/company-research"] }),
  });

  const handleSearch = (name: string) => {
    setPendingCompany(name);
    setView("loading");
    researchMutation.mutate(name);
  };

  const handleSelectHistory = (rec: ResearchRecord) => {
    setActiveRecord(rec);
    setView("results");
  };

  if (view === "home") {
    return (
      <HomeView
        onSearch={handleSearch}
        history={history}
        onSelectHistory={handleSelectHistory}
        onDeleteHistory={id => deleteMutation.mutate(id)}
        historyLoading={historyLoading}
      />
    );
  }

  if (view === "loading") {
    return <LoadingView companyName={pendingCompany} />;
  }

  if (view === "results" && activeRecord) {
    return (
      <ResultsView
        record={activeRecord}
        onBack={() => setView("home")}
        onResearchCompetitor={handleSearch}
        researchPending={researchMutation.isPending}
      />
    );
  }

  return null;
}
