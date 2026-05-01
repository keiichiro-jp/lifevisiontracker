import { jsPDF } from "jspdf";

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

type AIAgentSuggestion = {
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  department: string;
};

type ResearchRecord = {
  companyName: string;
  industryTag?: string | null;
  organizationStructure: Department;
  businessActivities: BusinessActivity[];
  aiAgentSuggestions?: AIAgentSuggestion[] | null;
  competitors: Competitor[];
  summary: string | null;
  sources: Source[];
  createdAt: string;
};

const SOURCE_LABELS: Record<string, string> = {
  official_site: "公式サイト",
  job_posting: "求人情報",
  ir_document: "IR資料",
  press_release: "プレスリリース",
  linkedin: "LinkedIn",
  news: "ニュース",
  other: "その他",
};

// Colors
const BLUE = [37, 99, 235] as const;
const DARK = [17, 24, 39] as const;
const GRAY = [107, 114, 128] as const;
const LIGHT_GRAY = [243, 244, 246] as const;
const AMBER = [217, 119, 6] as const;
const AMBER_BG = [255, 251, 235] as const;
const WHITE = [255, 255, 255] as const;
const BORDER = [229, 231, 235] as const;

function setFont(doc: jsPDF, style: "normal" | "bold", size: number, color: readonly number[]) {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  doc.setTextColor(color[0], color[1], color[2]);
}

function rect(doc: jsPDF, x: number, y: number, w: number, h: number, color: readonly number[], radius = 0) {
  doc.setFillColor(color[0], color[1], color[2]);
  if (radius > 0) {
    doc.roundedRect(x, y, w, h, radius, radius, "F");
  } else {
    doc.rect(x, y, w, h, "F");
  }
}

function hrLine(doc: jsPDF, y: number, x1 = 14, x2 = 196) {
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
}

function addPageHeader(doc: jsPDF, companyName: string) {
  rect(doc, 0, 0, 210, 12, BLUE);
  setFont(doc, "bold", 8, WHITE);
  doc.text(`企業調査レポート｜${companyName}`, 14, 8);
  setFont(doc, "normal", 7, WHITE);
  const date = new Date().toLocaleDateString("ja-JP");
  doc.text(date, 196, 8, { align: "right" });
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  rect(doc, 14, y, 182, 8, BLUE, 2);
  setFont(doc, "bold", 10, WHITE);
  doc.text(title, 18, y + 5.5);
  return y + 12;
}

function splitText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

// Render department tree recursively
function renderDept(doc: jsPDF, dept: Department, x: number, y: number, pageH: number, depth: number): number {
  const pageWidth = 196;
  const indentUnit = 5;
  const indent = x + depth * indentUnit;
  const textW = pageWidth - indent - 14;

  if (depth === 0) {
    setFont(doc, "bold", 10, BLUE);
  } else if (depth === 1) {
    setFont(doc, "bold", 9, DARK);
  } else {
    setFont(doc, "normal", 8, GRAY);
  }

  if (y > pageH - 20) {
    doc.addPage();
    addPageHeader(doc, "");
    y = 20;
  }

  const nameLines = splitText(doc, dept.name, textW);
  doc.text(nameLines, indent, y);
  y += nameLines.length * (depth === 0 ? 5.5 : 4.5);

  if (dept.description) {
    setFont(doc, "normal", 7, GRAY);
    const descLines = splitText(doc, dept.description, textW - 4);
    doc.text(descLines, indent + 2, y);
    y += descLines.length * 3.8 + 1;
  }

  if (dept.roles && dept.roles.length > 0) {
    setFont(doc, "normal", 7, GRAY);
    const rolesText = "役職: " + dept.roles.join("、");
    const rLines = splitText(doc, rolesText, textW - 4);
    doc.text(rLines, indent + 2, y);
    y += rLines.length * 3.8 + 1;
  }

  y += 1;

  if (dept.subDepartments) {
    for (const child of dept.subDepartments) {
      y = renderDept(doc, child, x, y, pageH, depth + 1);
    }
  }

  return y;
}

export function generateCompanyPDF(record: ResearchRecord) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageH = 297;
  const marginX = 14;
  const contentW = 182;

  // ---- Page 1: Cover ----
  rect(doc, 0, 0, 210, 70, BLUE);

  setFont(doc, "bold", 22, WHITE);
  doc.text("企業調査レポート", 105, 30, { align: "center" });
  setFont(doc, "bold", 16, WHITE);
  doc.text(record.companyName, 105, 44, { align: "center" });

  setFont(doc, "normal", 9, WHITE);
  const dateStr = new Date(record.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
  });
  doc.text(`調査日時: ${dateStr}`, 105, 54, { align: "center" });
  if (record.industryTag) {
    setFont(doc, "normal", 8, WHITE);
    doc.text(record.industryTag, 105, 62, { align: "center" });
  }

  // Summary box
  if (record.summary) {
    rect(doc, marginX, 78, contentW, 40, LIGHT_GRAY, 3);
    setFont(doc, "bold", 9, DARK);
    doc.text("企業概要", marginX + 4, 84);
    hrLine(doc, 86, marginX + 4, marginX + contentW - 4);
    setFont(doc, "normal", 8, DARK);
    const sumLines = splitText(doc, record.summary, contentW - 10);
    doc.text(sumLines, marginX + 4, 91);
  }

  // Stats row
  const statsY = 125;
  const statBoxW = 55;
  const stats = [
    { label: "業務数", value: String(record.businessActivities.length) },
    { label: "部門数", value: String(record.organizationStructure.subDepartments?.length ?? 0) },
    { label: "競合企業", value: String(record.competitors.length) },
  ];
  stats.forEach((s, i) => {
    const sx = marginX + i * (statBoxW + 8.5);
    rect(doc, sx, statsY, statBoxW, 22, WHITE, 3);
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(sx, statsY, statBoxW, 22, 3, 3, "S");
    setFont(doc, "bold", 18, BLUE);
    doc.text(s.value, sx + statBoxW / 2, statsY + 13, { align: "center" });
    setFont(doc, "normal", 7, GRAY);
    doc.text(s.label, sx + statBoxW / 2, statsY + 19, { align: "center" });
  });

  // Competitors box on page 1
  if (record.competitors.length > 0) {
    let cy = 157;
    rect(doc, marginX, cy, contentW, 8, AMBER_BG, 2);
    setFont(doc, "bold", 9, AMBER);
    doc.text("競合企業 TOP 3", marginX + 4, cy + 5.5);
    cy += 11;

    record.competitors.forEach((comp, i) => {
      rect(doc, marginX, cy, contentW, 18, WHITE, 2);
      doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(marginX, cy, contentW, 18, 2, 2, "S");

      setFont(doc, "bold", 9, DARK);
      doc.text(`#${i + 1} ${comp.name}`, marginX + 4, cy + 6);
      setFont(doc, "normal", 7, GRAY);
      const reasonLines = splitText(doc, comp.reason, contentW - 30);
      doc.text(reasonLines[0] ?? "", marginX + 4, cy + 11);
      setFont(doc, "normal", 7, BLUE);
      doc.text(comp.industry, marginX + contentW - 4, cy + 6, { align: "right" });
      cy += 21;
    });
  }

  // ---- Page 2+: Organization ----
  doc.addPage();
  addPageHeader(doc, record.companyName);
  let y = 20;
  y = addSectionTitle(doc, "組織体系", y);
  y = renderDept(doc, record.organizationStructure, marginX, y, pageH, 0);

  // ---- Business Activities ----
  doc.addPage();
  addPageHeader(doc, record.companyName);
  y = 20;
  y = addSectionTitle(doc, `全業務内容一覧（${record.businessActivities.length}件）`, y);

  record.businessActivities.forEach((act, i) => {
    if (y > pageH - 28) {
      doc.addPage();
      addPageHeader(doc, record.companyName);
      y = 20;
    }

    // Row bg
    const rowBg = i % 2 === 0 ? WHITE : LIGHT_GRAY;
    const rowH = 22;
    rect(doc, marginX, y, contentW, rowH, rowBg);

    // Number badge
    rect(doc, marginX + 1, y + 2, 8, 6, BLUE, 1);
    setFont(doc, "bold", 6, WHITE);
    doc.text(String(i + 1), marginX + 5, y + 6, { align: "center" });

    // Activity name
    setFont(doc, "bold", 8, DARK);
    const nameLines = splitText(doc, act.name, 100);
    doc.text(nameLines[0] ?? "", marginX + 12, y + 6);

    // Source badge
    const srcLabel = SOURCE_LABELS[act.sourceType] ?? "その他";
    const badgeW = 20;
    rect(doc, marginX + contentW - badgeW - 2, y + 2, badgeW, 5.5, BLUE, 1);
    setFont(doc, "normal", 6, WHITE);
    doc.text(srcLabel, marginX + contentW - badgeW / 2 - 2, y + 5.5, { align: "center" });

    // Department
    setFont(doc, "normal", 7, BLUE);
    doc.text(act.department, marginX + 12, y + 11);

    // Description
    setFont(doc, "normal", 7, DARK);
    const descLines = splitText(doc, act.description, contentW - 16);
    const maxDesc = descLines.slice(0, 2);
    doc.text(maxDesc, marginX + 12, y + 16);

    y += rowH + 1;
  });

  // ---- AI Agent Suggestions ----
  if (record.aiAgentSuggestions && record.aiAgentSuggestions.length > 0) {
    if (y > pageH - 50) {
      doc.addPage();
      addPageHeader(doc, record.companyName);
      y = 20;
    }
    y += 4;
    y = addSectionTitle(doc, "AIエージェント活用提案", y);

    const PRIORITY_COLORS: Record<string, readonly number[]> = {
      high: [220, 38, 38],
      medium: [217, 119, 6],
      low: [22, 163, 74],
    };
    const PRIORITY_JP: Record<string, string> = { high: "優先度：高", medium: "優先度：中", low: "優先度：低" };

    record.aiAgentSuggestions.forEach((sug, i) => {
      if (y > pageH - 30) {
        doc.addPage();
        addPageHeader(doc, record.companyName);
        y = 20;
      }
      const bgColor = i % 2 === 0 ? WHITE : LIGHT_GRAY;
      rect(doc, marginX, y, contentW, 26, bgColor);

      const priColor = PRIORITY_COLORS[sug.priority] ?? GRAY;
      setFont(doc, "bold", 8, priColor as any);
      const nameLines = splitText(doc, sug.name, contentW - 32);
      doc.text(nameLines[0] ?? "", marginX + 3, y + 6);

      setFont(doc, "normal", 6, GRAY);
      doc.text(PRIORITY_JP[sug.priority] ?? "", marginX + contentW - 3, y + 6, { align: "right" });

      setFont(doc, "normal", 7, DARK);
      const descLines = splitText(doc, sug.description, contentW - 6);
      doc.text(descLines.slice(0, 2), marginX + 3, y + 12);

      setFont(doc, "normal", 6, GRAY);
      doc.text(`対象: ${sug.department}`, marginX + 3, y + 23);

      y += 28;
    });
  }

  // ---- Sources ----
  if (record.sources && record.sources.length > 0) {
    if (y > pageH - 50) {
      doc.addPage();
      addPageHeader(doc, record.companyName);
      y = 20;
    }
    y += 4;
    y = addSectionTitle(doc, "調査ソース", y);
    record.sources.forEach((src) => {
      if (y > pageH - 16) {
        doc.addPage();
        addPageHeader(doc, record.companyName);
        y = 20;
      }
      setFont(doc, "bold", 8, DARK);
      doc.text(src.description, marginX + 2, y);
      setFont(doc, "normal", 7, GRAY);
      const urlLines = splitText(doc, src.url, contentW - 30);
      doc.text(urlLines[0] ?? "", marginX + 2, y + 4);
      setFont(doc, "normal", 6, BLUE);
      doc.text(`[${src.type}]`, marginX + contentW - 2, y, { align: "right" });
      hrLine(doc, y + 7);
      y += 9;
    });
  }

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    setFont(doc, "normal", 7, GRAY);
    doc.text(`${p} / ${totalPages}`, 105, 290, { align: "center" });
  }

  const safeName = record.companyName.replace(/[^\w぀-鿿]/g, "_");
  doc.save(`企業調査_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
