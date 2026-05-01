import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Search, Trash2, Download, ChevronRight, ChevronDown, RefreshCw, FileSpreadsheet, Users, Briefcase, TrendingUp, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { CompanyResearch, OrgUnit, BusinessOperation, CompetitorInfo } from "@shared/schema";
import { exportToPDF } from "./export-pdf";
import { exportToExcel } from "./export-excel";

async function apiRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

// Recursive org tree node
function OrgNode({ node, depth = 0 }: { node: OrgUnit; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const typeColors: Record<string, string> = {
    division: "bg-blue-500",
    department: "bg-indigo-400",
    team: "bg-violet-400",
    role: "bg-slate-400",
  };
  const indentPx = depth * 20;

  return (
    <div className="select-none">
      <div
        className="flex items-start gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group"
        style={{ paddingLeft: `${12 + indentPx}px` }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        <div className="mt-1 flex-shrink-0">
          {hasChildren ? (
            open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />
          ) : (
            <div className="w-3.5" />
          )}
        </div>
        <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${typeColors[node.type] || "bg-slate-400"}`} />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{node.name}</span>
          {node.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{node.description}</p>
          )}
        </div>
      </div>
      {open && hasChildren && (
        <div className="border-l border-slate-100 dark:border-slate-700 ml-5">
          {node.children!.map((child, i) => (
            <OrgNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  "営業・販売": "bg-blue-100 text-blue-700",
  "マーケティング": "bg-pink-100 text-pink-700",
  "開発・エンジニアリング": "bg-green-100 text-green-700",
  "人事・採用": "bg-yellow-100 text-yellow-700",
  "財務・経理": "bg-orange-100 text-orange-700",
  "法務・コンプライアンス": "bg-red-100 text-red-700",
  "カスタマーサポート": "bg-cyan-100 text-cyan-700",
  "経営企画": "bg-purple-100 text-purple-700",
  "広報・PR": "bg-rose-100 text-rose-700",
  "購買・調達": "bg-amber-100 text-amber-700",
  "物流・サプライチェーン": "bg-teal-100 text-teal-700",
  "品質管理": "bg-lime-100 text-lime-700",
};

function categoryClass(cat: string) {
  return CATEGORY_COLORS[cat] || "bg-slate-100 text-slate-700";
}

export default function CompanyResearchPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Fetch history
  const { data: history = [] } = useQuery<CompanyResearch[]>({
    queryKey: ["/api/company-research"],
    queryFn: () => apiRequest("GET", "/api/company-research"),
  });

  // Fetch selected detail
  const { data: selected, isLoading: detailLoading } = useQuery<CompanyResearch>({
    queryKey: ["/api/company-research", selectedId],
    queryFn: () => apiRequest("GET", `/api/company-research/${selectedId}`),
    enabled: !!selectedId,
  });

  // Research mutation
  const researchMutation = useMutation({
    mutationFn: (companyName: string) => apiRequest("POST", "/api/company-research", { companyName }),
    onSuccess: (data: CompanyResearch) => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-research"] });
      setSelectedId(data.id);
      setSearchInput("");
      toast({ title: "調査完了", description: `${data.companyName}の調査が完了しました` });
    },
    onError: (e: Error) => {
      toast({ title: "調査失敗", description: e.message, variant: "destructive" });
    },
  });

  // Competitor research mutation
  const competitorMutation = useMutation({
    mutationFn: ({ competitorName, originalCompany }: { competitorName: string; originalCompany: string }) =>
      apiRequest("POST", "/api/company-research/competitor", { competitorName, originalCompany }),
    onSuccess: (data: CompanyResearch) => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-research"] });
      setSelectedId(data.id);
      toast({ title: "競合調査完了", description: `${data.companyName}の調査が完了しました` });
    },
    onError: (e: Error) => {
      toast({ title: "競合調査失敗", description: e.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/company-research/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-research"] });
      if (selectedId === id) setSelectedId(null);
      toast({ title: "削除完了" });
    },
  });

  const handleSearch = () => {
    const name = searchInput.trim();
    if (!name) return;
    researchMutation.mutate(name);
  };

  const businessOps: BusinessOperation[] = (selected?.businessOperations as BusinessOperation[]) || [];
  const categories = ["all", ...Array.from(new Set(businessOps.map((op) => op.category).filter(Boolean)))];
  const filteredOps = filterCategory === "all" ? businessOps : businessOps.filter((op) => op.category === filterCategory);
  const competitors: CompetitorInfo[] = (selected?.competitors as CompetitorInfo[]) || [];
  const orgStructure = selected?.organizationStructure as OrgUnit | null;

  const isResearching = researchMutation.isPending || competitorMutation.isPending;

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Left sidebar - history */}
      <aside className="w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="text-blue-600" size={20} />
            <h1 className="font-bold text-slate-900 dark:text-white text-base">企業調査ツール</h1>
          </div>
          <p className="text-xs text-slate-500">AIが組織・業務を自動分析</p>
        </div>

        {/* Search box */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <Input
              placeholder="会社名を入力..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="text-sm h-8"
              disabled={isResearching}
            />
            <Button size="sm" onClick={handleSearch} disabled={isResearching || !searchInput.trim()} className="h-8 px-2 bg-blue-600 hover:bg-blue-700">
              {isResearching ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            </Button>
          </div>
          {isResearching && (
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin" /> AI調査中（1〜2分かかります）...
            </p>
          )}
        </div>

        {/* History list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {history.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">調査履歴がありません</p>
            )}
            {history.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer group transition-colors ${
                  selectedId === item.id
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
                onClick={() => setSelectedId(item.id)}
              >
                <Building2 size={14} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.companyName}</p>
                  <p className="text-xs text-slate-400 truncate">{item.industry || "業種不明"}</p>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!selected && !detailLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Building2 size={64} className="text-slate-200 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-400">企業を検索してください</h2>
              <p className="text-sm text-slate-400 mt-1">左のサイドバーから会社名を入力すると、AIが自動調査します</p>
            </div>
          </div>
        )}

        {detailLoading && (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw size={32} className="text-blue-400 animate-spin" />
          </div>
        )}

        {selected && !detailLoading && (
          <>
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white dark:bg-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selected.officialName || selected.companyName}
                    </h2>
                    {selected.industry && (
                      <Badge variant="secondary" className="text-xs">{selected.industry}</Badge>
                    )}
                  </div>
                  {selected.summary && (
                    <p className="text-sm text-slate-500 mt-1 max-w-3xl line-clamp-2">{selected.summary}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    調査日時: {new Date(selected.createdAt).toLocaleString("ja-JP")}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportToExcel(selected)}
                    className="gap-1 text-xs"
                  >
                    <FileSpreadsheet size={13} /> Excel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => exportToPDF(selected)}
                    className="gap-1 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <Download size={13} /> PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Competitor section */}
            {competitors.length > 0 && (
              <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-blue-600" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    主要競合企業 Top 3
                  </span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {competitors.slice(0, 3).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.marketPosition}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 gap-1"
                        onClick={() => competitorMutation.mutate({ competitorName: c.name, originalCompany: selected.companyName })}
                        disabled={isResearching}
                      >
                        {isResearching ? <RefreshCw size={11} className="animate-spin" /> : <Search size={11} />}
                        調査
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="org" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-6 mt-3 mb-0 w-fit">
                <TabsTrigger value="org" className="gap-1.5 text-xs">
                  <Users size={13} /> 組織体系
                </TabsTrigger>
                <TabsTrigger value="ops" className="gap-1.5 text-xs">
                  <Briefcase size={13} /> 業務一覧
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-4">{businessOps.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="sources" className="gap-1.5 text-xs">
                  <ExternalLink size={13} /> 調査ソース
                </TabsTrigger>
              </TabsList>

              {/* Org structure tab */}
              <TabsContent value="org" className="flex-1 overflow-auto mx-6 mb-4 mt-3">
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-4">
                  {orgStructure ? (
                    <OrgNode node={orgStructure} depth={0} />
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-8">組織情報がありません</p>
                  )}
                </div>
              </TabsContent>

              {/* Business operations tab */}
              <TabsContent value="ops" className="flex-1 overflow-hidden flex flex-col mx-6 mb-4 mt-3">
                {/* Category filter */}
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-2 mb-3 flex-nowrap">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                          filterCategory === cat
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {cat === "all" ? "すべて" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-2">
                    {filteredOps.map((op, i) => (
                      <div
                        key={op.id || i}
                        className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryClass(op.category)}`}>
                                {op.category}
                              </span>
                              {op.department && (
                                <span className="text-xs text-slate-400">{op.department}</span>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{op.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{op.description}</p>
                            {op.sourceUrl && (
                              <a
                                href={op.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline mt-1 flex items-center gap-1"
                              >
                                <ExternalLink size={10} /> ソース
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredOps.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-8">業務情報がありません</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Sources tab */}
              <TabsContent value="sources" className="flex-1 overflow-auto mx-6 mb-4 mt-3">
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-3">
                  {((selected.sources as any[]) || []).map((s: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <ExternalLink size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.type}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                        {s.url && (
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                            {s.url}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {((selected.sources as any[]) || []).length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8">ソース情報がありません</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
