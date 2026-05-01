import jsPDF from "jspdf";
import type { CompanyResearch, BusinessOperation, CompetitorInfo, OrgUnit } from "@shared/schema";

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function flattenOrg(node: OrgUnit, depth = 0): { name: string; depth: number; desc: string }[] {
  const result: { name: string; depth: number; desc: string }[] = [];
  result.push({ name: node.name, depth, desc: node.description || "" });
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenOrg(child, depth + 1));
    }
  }
  return result;
}

export function exportToPDF(record: CompanyResearch) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ---- Cover / Header ----
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, pageW, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Company Research Report", margin, 18);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(record.officialName || record.companyName, margin, 28);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date(record.createdAt).toLocaleString("ja-JP")}`, margin, 36);

  y = 50;
  doc.setTextColor(30, 30, 30);

  // ---- Summary ----
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Company Overview", margin, y);
  y += 6;
  doc.setDrawColor(37, 99, 235);
  doc.line(margin, y, margin + contentW, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  if (record.industry) {
    doc.setFont("helvetica", "bold");
    doc.text("Industry: ", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(record.industry, margin + 22, y);
    y += 6;
  }
  if (record.summary) {
    y = addWrappedText(doc, record.summary, margin, y, contentW, 5);
    y += 4;
  }

  // ---- Competitors ----
  const competitors: CompetitorInfo[] = (record.competitors as CompetitorInfo[]) || [];
  if (competitors.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Top Competitors", margin, y);
    y += 6;
    doc.setDrawColor(37, 99, 235);
    doc.line(margin, y, margin + contentW, y);
    y += 6;

    doc.setFontSize(9);
    competitors.slice(0, 3).forEach((c, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(`${i + 1}. ${c.name}`, margin + 4, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      y = addWrappedText(doc, `  ${c.marketPosition} | ${c.reason}`, margin + 4, y, contentW - 8, 5);
      y += 3;
    });
    y += 4;
  }

  // ---- Organization Structure ----
  const org = record.organizationStructure as OrgUnit | null;
  if (org) {
    doc.addPage();
    y = 20;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Organization Structure", margin, y);
    y += 6;
    doc.setDrawColor(37, 99, 235);
    doc.line(margin, y, margin + contentW, y);
    y += 8;

    const flat = flattenOrg(org);
    doc.setFontSize(8);
    for (const item of flat) {
      if (y > 275) { doc.addPage(); y = 20; }
      const indent = margin + item.depth * 6;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(item.name, indent, y);
      y += 4;
      if (item.desc) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        y = addWrappedText(doc, item.desc, indent + 3, y, contentW - item.depth * 6 - 3, 4);
        y += 2;
      }
    }
  }

  // ---- Business Operations ----
  const ops: BusinessOperation[] = (record.businessOperations as BusinessOperation[]) || [];
  if (ops.length > 0) {
    doc.addPage();
    y = 20;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(`Business Operations (${ops.length})`, margin, y);
    y += 6;
    doc.setDrawColor(37, 99, 235);
    doc.line(margin, y, margin + contentW, y);
    y += 8;

    // Group by category
    const grouped: Record<string, BusinessOperation[]> = {};
    for (const op of ops) {
      const cat = op.category || "その他";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(op);
    }

    for (const [cat, catOps] of Object.entries(grouped)) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text(`[ ${cat} ]`, margin, y);
      y += 6;

      for (const op of catOps) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text(`• ${op.title}`, margin + 4, y);
        if (op.department) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          doc.text(`  [${op.department}]`, margin + 4 + doc.getTextWidth(`• ${op.title}`) + 2, y);
        }
        y += 5;
        if (op.description) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.setFontSize(8);
          y = addWrappedText(doc, op.description, margin + 8, y, contentW - 12, 4.5);
          y += 3;
        }
      }
      y += 4;
    }
  }

  // Page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`${i} / ${pageCount}`, pageW - margin, 290, { align: "right" });
    doc.text("AI Company Research Tool", margin, 290);
  }

  doc.save(`${record.companyName}_調査レポート.pdf`);
}
