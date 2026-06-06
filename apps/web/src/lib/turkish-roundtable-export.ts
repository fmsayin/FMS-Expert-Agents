import type {
  RoundTableChatMessage,
  TurkishExecutiveReport,
  TurkishSummaryEntry,
} from "@/components/roundtable/types";
import { downloadTextFile, markdownToPrintHtml, openPrintView } from "@/lib/roundtable-export";

function formatTurkishSummaries(summaries: TurkishSummaryEntry[]): string {
  return summaries
    .filter((s) => !s.isLoading && s.summary)
    .map((s) => {
      const time = new Date(s.timestamp).toLocaleString("tr-TR");
      return `### ${s.figureName} — ${time}\n\n${s.summary}\n`;
    })
    .join("\n");
}

function formatReportSections(report: TurkishExecutiveReport): string {
  return [
    "## Yönetici Özeti",
    report.yoneticiOzeti,
    "",
    "## Konsensüs",
    report.konsensus,
    "",
    "## Anlaşmazlıklar",
    report.anlasmazliklar,
    "",
    "## Riskler",
    report.riskler,
    "",
    "## Öneriler",
    report.oneriler,
  ].join("\n");
}

export function buildTurkishDebateMarkdown(params: {
  topicTitle: string;
  topicFull?: string;
  summaries: TurkishSummaryEntry[];
  report?: TurkishExecutiveReport | null;
}): string {
  const { topicTitle, topicFull, summaries, report } = params;
  const lines: string[] = [
    `# FMS Think Tank — Türk Stratejik Gözlemci Raporu`,
    "",
    `**Konu:** ${topicTitle}`,
  ];

  if (topicFull && topicFull !== topicTitle) {
    lines.push("", topicFull);
  }

  if (summaries.length > 0) {
    lines.push("", "---", "", "## Canlı Özetler", "", formatTurkishSummaries(summaries));
  }

  if (report) {
    lines.push("", "---", "", "## Yönetici Raporu", "", formatReportSections(report));
  }

  lines.push("", "---", "", "*FMS Expert Agents — Türk Stratejik Gözlemci*");
  return lines.join("\n");
}

export function buildTurkishPolicyMemoMarkdown(params: {
  topicTitle: string;
  report: TurkishExecutiveReport;
}): string {
  const { topicTitle, report } = params;
  const date = new Date().toLocaleDateString("tr-TR", { dateStyle: "long" });

  return [
    `# POLİTİKA NOTU`,
    "",
    `**KİME:** Üst Düzey Yönetim`,
    `**KİMDEN:** FMS Think Tank — Türk Stratejik Gözlemci`,
    `**KONU:** ${topicTitle}`,
    `**TARİH:** ${date}`,
    "",
    "## Özet",
    report.yoneticiOzeti,
    "",
    "## Önerilen Eylemler",
    report.oneriler,
    "",
    "## Riskler ve Azaltma",
    report.riskler,
    "",
    "## Karşıt Görüşler (bilgi amaçlı)",
    report.anlasmazliklar,
    "",
    "## Destekleyici Konsensüs",
    report.konsensus,
    "",
    "---",
    "*Gizli çalışma belgesi — FMS Expert Agents*",
  ].join("\n");
}

export function buildTurkishResearchBriefMarkdown(params: {
  topicTitle: string;
  report: TurkishExecutiveReport;
  exchangeCount: number;
}): string {
  const { topicTitle, report, exchangeCount } = params;
  const date = new Date().toLocaleDateString("tr-TR", { dateStyle: "long" });

  return [
    `# Araştırma Özeti`,
    "",
    `**Konu:** ${topicTitle}`,
    `**Tarih:** ${date}`,
    `**İncelenen mübadele sayısı:** ${exchangeCount}`,
    "",
    "## Yönetici Özeti",
    report.yoneticiOzeti,
    "",
    "## Temel Bulgular",
    "### Uzlaşı Alanları",
    report.konsensus,
    "",
    "### Anlaşmazlık Noktaları",
    report.anlasmazliklar,
    "",
    "## Risk Değerlendirmesi",
    report.riskler,
    "",
    "## Politika Çıkarımları",
    report.oneriler,
    "",
    "---",
    "*FMS Think Tank — Türk Stratejik Gözlemci Araştırma Özeti*",
  ].join("\n");
}

export function printTurkishReport(params: {
  topicTitle: string;
  topicFull?: string;
  summaries: TurkishSummaryEntry[];
  report: TurkishExecutiveReport;
}): void {
  const md = buildTurkishDebateMarkdown(params);
  const html = markdownToPrintHtml(md.replace(/\n/g, "\n"));
  openPrintView(`<div>${html}</div>`, `Türk Stratejik Gözlemci — ${params.topicTitle}`);
}

export { downloadTextFile };
