import * as XLSX from "xlsx";
import type { CompanyResearch, BusinessOperation, CompetitorInfo, OrgUnit } from "@shared/schema";

function flattenOrg(node: OrgUnit, depth = 0): { level: number; name: string; type: string; description: string }[] {
  const result: { level: number; name: string; type: string; description: string }[] = [];
  result.push({ level: depth + 1, name: "　".repeat(depth) + node.name, type: node.type, description: node.description || "" });
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenOrg(child, depth + 1));
    }
  }
  return result;
}

export function exportToExcel(record: CompanyResearch) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Overview
  const overviewData = [
    ["企業調査レポート"],
    [],
    ["会社名", record.companyName],
    ["正式名称", record.officialName || ""],
    ["業種", record.industry || ""],
    ["調査日時", new Date(record.createdAt).toLocaleString("ja-JP")],
    [],
    ["概要"],
    [record.summary || ""],
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  wsOverview["!cols"] = [{ wch: 20 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsOverview, "概要");

  // Sheet 2: Organization
  const org = record.organizationStructure as OrgUnit | null;
  if (org) {
    const flat = flattenOrg(org);
    const orgData = [
      ["レベル", "組織名", "種別", "説明"],
      ...flat.map((r) => [r.level, r.name, r.type, r.description]),
    ];
    const wsOrg = XLSX.utils.aoa_to_sheet(orgData);
    wsOrg["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 12 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsOrg, "組織体系");
  }

  // Sheet 3: Business Operations
  const ops: BusinessOperation[] = (record.businessOperations as BusinessOperation[]) || [];
  const opsData = [
    ["No.", "カテゴリ", "担当部署", "業務名", "業務概要", "ソースURL"],
    ...ops.map((op, i) => [i + 1, op.category || "", op.department || "", op.title, op.description, op.sourceUrl || ""]),
  ];
  const wsOps = XLSX.utils.aoa_to_sheet(opsData);
  wsOps["!cols"] = [{ wch: 5 }, { wch: 18 }, { wch: 18 }, { wch: 25 }, { wch: 60 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsOps, "業務一覧");

  // Sheet 4: Competitors
  const competitors: CompetitorInfo[] = (record.competitors as CompetitorInfo[]) || [];
  const compData = [
    ["企業名", "競合理由", "市場ポジション"],
    ...competitors.map((c) => [c.name, c.reason, c.marketPosition]),
  ];
  const wsComp = XLSX.utils.aoa_to_sheet(compData);
  wsComp["!cols"] = [{ wch: 20 }, { wch: 50 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsComp, "競合企業");

  XLSX.writeFile(wb, `${record.companyName}_調査レポート.xlsx`);
}
