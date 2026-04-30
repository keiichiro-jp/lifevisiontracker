import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Search, Download, Trash2, ChevronRight, ChevronDown, ExternalLink, Clock, Users, Briefcase, BarChart2, AlertCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

type Competitor = {
  name: string;
  reason: string;
  industry: string;
};

type Source = {
  type: string;
  description: string;
  url: string;
};

type ResearchRecord = {
  id: number;
  companyName: string;
  organizationStructure: Department;
  businessActivities: BusinessActivity[];
  competitors: Competitor[];
  summary: string | null;
  sources: Source[];
  createdAt: string;
};

// ---- Source type label map ----
const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  official_site: { label: "公式サイト", color: "bg-blue-100 text-blue-800" },
  job_posting: { label: "求人情報", color: "bg-green-100 text-green-800" },
  ir_document: { label: "IR資料", color: "bg-purple-100 text-purple-800" },
  press_release: { label: "プレスリリース", color: "bg-yellow-100 text-yellow-800" },
  linkedin: { label: "LinkedIn", color: "bg-sky-100 text-sky-800" },
  news: { label: "ニュース", color: "bg-orange-100 text-orange-800" },
  other: { label: "その他", color: "bg-gray-100 text-gray-700" },
};

// ---- Department tree component ----
function DepartmentNode({ dept, depth = 0 }: { dept: Department; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = (dept.subDepartments && dept.subDepartments.length > 0) || (dept.roles && dept.roles.length > 0);

  return (
    <div className={`${depth > 0 ? "ml-5 border-l border-blue-100 pl-3" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-start gap-2 w-full text-left py-2 hover:bg-blue-50 rounded-lg px-2 group transition-colors"
      >
        <span className="mt-0.5 text-blue-400 shrink-0">
          {hasChildren ? (open ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <span className="w-4 inline-block" />}
        </span>
        <div>
          <p className={`font-semibold ${depth === 0 ? "text-blue-700 text-base" : depth === 1 ? "text-gray-800" : "text-gray-700 text-sm"}`}>
            {dept.name}
          </p>
          {dept.description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{dept.description}</p>}
        </div>
      </button>

      {open && (
        <div>
          {dept.roles && dept.roles.length > 0 && (
            <div className="ml-7 mb-1 flex flex-wrap gap-1">
              {dept.roles.map((role, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {role}
                </span>
              ))}
            </div>
          )}
          {dept.subDepartments?.map((child, i) => (
            <DepartmentNode key={i} dept={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Main page ----
export default function CompanyResearchPage() {
  const [companyInput, setCompanyInput] = useState("");
  const [activeRecord, setActiveRecord] = useState<ResearchRecord | null>(null);
  const [activeTab, setActiveTab] = useState("organization");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: history = [], isLoading: historyLoading } = useQuery<ResearchRecord[]>({
    queryKey: ["/api/company-research"],
    queryFn: async () => {
      const res = await fetch("/api/company-research");
      if (!res.ok) throw new Error("Failed to fetch history");
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
        const err = await res.json();
        throw new Error(err.message || "Research failed");
      }
      return res.json() as Promise<ResearchRecord>;
    },
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-research"] });
      setActiveRecord(record);
      setActiveTab("organization");
      toast({ title: "調査完了", description: `${record.companyName}の調査が完了しました` });
    },
    onError: (err: Error) => {
      toast({ title: "エラー", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/company-research/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-research"] });
      if (activeRecord?.id === id) setActiveRecord(null);
      toast({ title: "削除しました" });
    },
  });

  const handleSearch = () => {
    const name = companyInput.trim();
    if (!name) return;
    researchMutation.mutate(name);
  };

  const handleCompetitorResearch = (name: string) => {
    setCompanyInput(name);
    researchMutation.mutate(name);
  };

  const handleExportPDF = () => {
    if (!activeRecord) return;
    try {
      generateCompanyPDF(activeRecord);
      toast({ title: "PDFをダウンロードしました" });
    } catch (e) {
      toast({ title: "PDFエラー", description: String(e), variant: "destructive" });
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" />
            <h1 className="font-bold text-gray-900 text-sm">企業調査ツール</h1>
          </div>
        </div>

        <div className="p-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">調査履歴</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {historyLoading && (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          )}
          {!historyLoading && history.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8 px-4">まだ調査履歴がありません</p>
          )}
          {history.map((rec) => (
            <div
              key={rec.id}
              className={`group flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeRecord?.id === rec.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}
              onClick={() => { setActiveRecord(rec); setActiveTab("organization"); }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{rec.companyName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(rec.createdAt)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(rec.id); }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all ml-2 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-2xl flex gap-2">
            <Input
              placeholder="会社名を入力（例：トヨタ自動車、Sony、Recruit）"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={researchMutation.isPending || !companyInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {researchMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> 調査中...</>
              ) : (
                <><Search size={16} /> 調査開始</>
              )}
            </Button>
          </div>
          {researchMutation.isPending && (
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              公式サイト・求人情報・IR資料・プレスリリースなどを横断調査しています...
            </p>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!activeRecord && !researchMutation.isPending && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Building2 size={48} className="text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-500 mb-2">企業を調査してみましょう</h2>
              <p className="text-sm text-gray-400 max-w-sm">
                会社名を入力して「調査開始」を押すと、組織体系と全業務内容を自動でリスト化します。
              </p>
            </div>
          )}

          {researchMutation.isPending && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
              <p className="text-lg font-medium text-gray-700">調査中...</p>
              <p className="text-sm text-gray-400 mt-2">複数のソースを横断して情報を収集・分析しています</p>
            </div>
          )}

          {activeRecord && !researchMutation.isPending && (
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{activeRecord.companyName}</h2>
                  {activeRecord.summary && (
                    <p className="text-sm text-gray-600 mt-2 max-w-3xl leading-relaxed">{activeRecord.summary}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>調査日時: {formatDate(activeRecord.createdAt)}</span>
                    <span>·</span>
                    <span>{activeRecord.businessActivities.length}件の業務</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="gap-2 shrink-0"
                >
                  <Download size={16} />
                  PDFエクスポート
                </Button>
              </div>

              {/* Competitors */}
              {activeRecord.competitors && activeRecord.competitors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 size={16} className="text-amber-600" />
                    <h3 className="font-semibold text-amber-800 text-sm">競合企業 TOP {activeRecord.competitors.length}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeRecord.competitors.map((comp, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-amber-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800 text-sm">{comp.name}</p>
                          <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">#{i + 1}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{comp.reason}</p>
                        <Badge variant="outline" className="text-xs">{comp.industry}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 text-xs h-7 gap-1"
                          onClick={() => handleCompetitorResearch(comp.name)}
                          disabled={researchMutation.isPending}
                        >
                          <Plus size={12} />
                          この企業を調査
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="organization" className="gap-2">
                    <Users size={14} /> 組織体系
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="gap-2">
                    <Briefcase size={14} /> 業務内容 ({activeRecord.businessActivities.length})
                  </TabsTrigger>
                  <TabsTrigger value="sources" className="gap-2">
                    <ExternalLink size={14} /> 調査ソース
                  </TabsTrigger>
                </TabsList>

                {/* Organization tab */}
                <TabsContent value="organization">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Users size={16} className="text-blue-500" /> 組織階層
                    </h3>
                    <DepartmentNode dept={activeRecord.organizationStructure} depth={0} />
                  </div>
                </TabsContent>

                {/* Business activities tab */}
                <TabsContent value="activities">
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">全業務一覧</h3>
                      <span className="text-xs text-gray-400">{activeRecord.businessActivities.length}件</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {activeRecord.businessActivities.map((act, i) => {
                        const src = SOURCE_LABELS[act.sourceType] || SOURCE_LABELS.other;
                        return (
                          <div key={i} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p className="font-medium text-gray-800 text-sm">{act.name}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${src.color}`}>{src.label}</span>
                                </div>
                                <p className="text-xs text-blue-600 mb-1">{act.department}</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{act.description}</p>
                              </div>
                              {act.sourceUrl && (
                                <a
                                  href={act.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-blue-500 shrink-0 mt-0.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Sources tab */}
                <TabsContent value="sources">
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700">参照ソース一覧</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {activeRecord.sources.map((src, i) => (
                        <div key={i} className="px-5 py-3 flex items-center gap-3">
                          <ExternalLink size={14} className="text-gray-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700">{src.description}</p>
                            <p className="text-xs text-gray-400 truncate">{src.url}</p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">{src.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
