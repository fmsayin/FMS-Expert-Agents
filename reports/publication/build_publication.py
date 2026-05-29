#!/usr/bin/env python3
"""Optional legacy HTML export for FMS Strategic Review.

Canonical publication (Markdown only):
  reports/FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md

HTML generation is DISABLED by default. Pass --html to write deprecated browser editions
under reports/publication/_archived/ (or pass --html-out-dir to override).
"""
from __future__ import annotations

import argparse
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SRC = ROOT / "reports" / "FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md"
OUT = ROOT / "reports" / "publication"
OUT_FLAGSHIP = OUT / "_archived" / "index-flagship.html"
CSS_LINK = "../styles/journal.css"

# ---------------------------------------------------------------------------
# SVG Figures
# ---------------------------------------------------------------------------

FIG_PEACE_ARCHITECTURE = """<figure class="journal-figure" id="fig-peace-architecture">
<figcaption><span class="figure-label">Figure 0.</span> FMS Peace Architecture Framework™ — seven pillars with Multilateral Cooperation (GDAIC hub) at center. Source: FMS Strategic Review Flagship (2026).</figcaption>
<img src="figures/fms-peace-architecture-framework.svg" alt="FMS Peace Architecture Framework seven pillars diagram" width="640" height="640"/>
</figure>"""

FIG_CONFLICT_TREND = """<figure class="journal-figure" id="fig-conflict-trend">
<figcaption><span class="figure-label">Figure 1.</span> State-based armed conflicts, illustrative UCDP-style trend (1990–2025). Source: Uppsala University (2024); editorial visualization.</figcaption>
<svg viewBox="0 0 640 320" role="img" aria-labelledby="fig1-title fig1-desc">
<title id="fig1-title">Conflict trend line 1990-2025</title>
<desc id="fig1-desc">Line chart showing rising state-based armed conflicts from approximately 30 in 1990 to 59 in 2023.</desc>
<rect width="640" height="320" fill="#faf9f7"/>
<text x="320" y="24" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#1a2744">State-Based Armed Conflicts (Illustrative)</text>
<line x1="60" y1="260" x2="600" y2="260" stroke="#4a5568" stroke-width="1"/>
<line x1="60" y1="260" x2="60" y2="50" stroke="#4a5568" stroke-width="1"/>
<text x="48" y="265" font-size="10" fill="#4a5568">0</text>
<text x="40" y="160" font-size="10" fill="#4a5568">40</text>
<text x="40" y="60" font-size="10" fill="#4a5568">60</text>
<text x="100" y="278" font-size="9" fill="#4a5568">1990</text>
<text x="220" y="278" font-size="9" fill="#4a5568">2000</text>
<text x="340" y="278" font-size="9" fill="#4a5568">2010</text>
<text x="460" y="278" font-size="9" fill="#4a5568">2020</text>
<text x="560" y="278" font-size="9" fill="#4a5568">2025</text>
<polyline fill="none" stroke="#1a2744" stroke-width="2.5" points="100,200 160,185 220,170 280,155 340,140 400,125 460,110 520,95 560,82"/>
<circle cx="560" cy="82" r="5" fill="#b8860b"/>
<text x="570" y="78" font-size="10" fill="#1a2744">59 (2023)</text>
</svg>
</figure>"""

FIG_ECONOMIC_VIOLENCE = """<figure class="journal-figure" id="fig-economic-violence">
<figcaption><span class="figure-label">Figure 2.</span> Global economic impact of violence — illustrative components (USD trillions, 2023). Source: Institute for Economics &amp; Peace (2024).</figcaption>
<svg viewBox="0 0 640 360" role="img" aria-labelledby="fig2-title fig2-desc">
<title id="fig2-title">Economic cost of violence bar chart</title>
<desc id="fig2-desc">Horizontal bars for military expenditure, internal security, and other violence-related costs totaling over 19 trillion USD.</desc>
<rect width="640" height="360" fill="#faf9f7"/>
<text x="320" y="28" text-anchor="middle" font-size="13" fill="#1a2744">Economic Impact of Violence (Illustrative, 2023)</text>
<rect x="180" y="60" width="380" height="36" fill="#1a2744"/><text x="170" y="84" text-anchor="end" font-size="11">Military &amp; security</text><text x="570" y="84" font-size="11">~$12T</text>
<rect x="180" y="110" width="300" height="36" fill="#3d5a80"/><text x="170" y="134" text-anchor="end" font-size="11">Internal conflict</text><text x="490" y="134" font-size="11">~$5T</text>
<rect x="180" y="160" width="220" height="36" fill="#6b7c93"/><text x="170" y="184" text-anchor="end" font-size="11">Crime &amp; homicide</text><text x="410" y="184" font-size="11">~$2T</text>
<rect x="180" y="210" width="120" height="36" fill="#b8860b"/><text x="170" y="234" text-anchor="end" font-size="11">Prevention gap</text><text x="310" y="234" font-size="11">&lt;$0.2T</text>
<text x="320" y="300" text-anchor="middle" font-size="10" fill="#4a5568">Total broad measure: &gt;$19 trillion (IEP, 2024)</text>
</svg>
</figure>"""

FIG_SCENARIO_MATRIX = """<figure class="journal-figure" id="fig-scenario-matrix">
<figcaption><span class="figure-label">Figure 3.</span> Four-scenario probability matrix (illustrative planning ranges, 2026–2035).</figcaption>
<svg viewBox="0 0 640 400" role="img" aria-labelledby="fig3-title fig3-desc">
<title id="fig3-title">Scenario probability matrix</title>
<desc id="fig3-desc">Matrix showing Geneva Consensus 15-20%, Fragmented Progress 50-55%, Algorithmic Bloc Rivalry 20-25%, Synthetic Casus Belli 5-8%.</desc>
<rect width="640" height="400" fill="#faf9f7"/>
<text x="320" y="28" text-anchor="middle" font-size="13" fill="#1a2744">Policy Scenario Probabilities (Illustrative)</text>
<rect x="80" y="60" width="220" height="70" fill="#e8f0e8" stroke="#2d5a2d"/><text x="190" y="90" text-anchor="middle" font-size="12" fill="#1a2744">Geneva Consensus</text><text x="190" y="115" text-anchor="middle" font-size="14" font-weight="bold">15–20%</text>
<rect x="340" y="60" width="220" height="70" fill="#eef2f8" stroke="#1a2744"/><text x="450" y="90" text-anchor="middle" font-size="12">Fragmented Progress</text><text x="450" y="115" text-anchor="middle" font-size="14" font-weight="bold">50–55%</text>
<rect x="80" y="160" width="220" height="70" fill="#fde8e8" stroke="#8b2942"/><text x="190" y="190" text-anchor="middle" font-size="12">Algorithmic Bloc Rivalry</text><text x="190" y="215" text-anchor="middle" font-size="14" font-weight="bold">20–25%</text>
<rect x="340" y="160" width="220" height="70" fill="#2a1a1a" stroke="#000"/><text x="450" y="190" text-anchor="middle" font-size="12" fill="#fff">Synthetic Casus Belli</text><text x="450" y="215" text-anchor="middle" font-size="14" font-weight="bold" fill="#f5d76e">5–8%</text>
<text x="320" y="320" text-anchor="middle" font-size="10" fill="#4a5568">Default trajectory without GDAIC: Fragmented Progress</text>
</svg>
</figure>"""

FIG_AI_ADOPTION = """<figure class="journal-figure" id="fig-ai-adoption">
<figcaption><span class="figure-label">Figure 4.</span> AI adoption in diplomacy — illustrative projection (2030–2050).</figcaption>
<svg viewBox="0 0 640 320" role="img" aria-labelledby="fig4-title fig4-desc">
<title id="fig4-title">AI adoption in diplomacy projection</title>
<desc id="fig4-desc">Two lines showing G7 diplomatic AI adoption reaching 85% by 2050 and UN member states with GDAIC-aligned systems reaching 65%.</desc>
<rect width="640" height="320" fill="#faf9f7"/>
<text x="320" y="24" text-anchor="middle" font-size="13" fill="#1a2744">Diplomatic AI Adoption (% FM Crisis Monitoring)</text>
<line x1="60" y1="260" x2="580" y2="260" stroke="#4a5568"/>
<line x1="60" y1="260" x2="60" y2="50" stroke="#4a5568"/>
<text x="120" y="278" font-size="9">2030</text><text x="280" y="278" font-size="9">2040</text><text x="440" y="278" font-size="9">2050</text>
<polyline fill="none" stroke="#1a2744" stroke-width="2" points="120,220 280,160 440,100"/>
<polyline fill="none" stroke="#b8860b" stroke-width="2" stroke-dasharray="6,4" points="120,240 280,200 440,140"/>
<text x="450" y="105" font-size="10" fill="#1a2744">G7+ FMs</text>
<text x="450" y="145" font-size="10" fill="#b8860b">GDAIC-aligned states</text>
</svg>
</figure>"""

FIG_GDAIC_ORG = """<figure class="journal-figure" id="fig-gdaic-org">
<figcaption><span class="figure-label">Figure 5.</span> GDAIC governance structure (illustrative org chart).</figcaption>
<svg viewBox="0 0 640 420" role="img" aria-labelledby="fig5-title fig5-desc">
<title id="fig5-title">GDAIC governance structure</title>
<desc id="fig5-desc">Org chart with Conference of Parties at top, Technical Secretariat and Independent Review Panel below, and UN diplomatic AI commons at base.</desc>
<rect width="640" height="420" fill="#faf9f7"/>
<rect x="220" y="30" width="200" height="50" rx="4" fill="#1a2744"/><text x="320" y="60" text-anchor="middle" fill="#fff" font-size="12">Conference of Parties</text>
<line x1="320" y1="80" x2="320" y2="110" stroke="#4a5568"/>
<line x1="160" y1="110" x2="480" y2="110" stroke="#4a5568"/>
<line x1="160" y1="110" x2="160" y2="130" stroke="#4a5568"/>
<line x1="480" y1="110" x2="480" y2="130" stroke="#4a5568"/>
<rect x="60" y="130" width="200" height="50" rx="4" fill="#3d5a80"/><text x="160" y="160" text-anchor="middle" fill="#fff" font-size="11">Technical Secretariat</text>
<rect x="380" y="130" width="200" height="50" rx="4" fill="#3d5a80"/><text x="480" y="160" text-anchor="middle" fill="#fff" font-size="11">Independent Review Panel</text>
<line x1="320" y1="180" x2="320" y2="220" stroke="#4a5568"/>
<rect x="170" y="220" width="300" height="50" rx="4" fill="#b8860b"/><text x="320" y="250" text-anchor="middle" fill="#1a2744" font-size="11">UN Diplomatic AI Commons</text>
<rect x="100" y="300" width="440" height="90" rx="4" fill="#eef2f8" stroke="#1a2744"/><text x="320" y="330" text-anchor="middle" font-size="11">Member states · Regional orgs · ICRC observers · Audited vendors</text>
</svg>
</figure>"""

FIG_RISK_HEATMAP = """<figure class="journal-figure" id="fig-risk-heatmap">
<figcaption><span class="figure-label">Figure 6.</span> Risk heat map — likelihood × impact (top diplomatic AI risks, illustrative).</figcaption>
<svg viewBox="0 0 480 400" role="img" aria-labelledby="fig6-title fig6-desc">
<title id="fig6-title">Risk heat map</title>
<desc id="fig6-desc">5x5 heat map grid with escalation by algorithm and synthetic information warfare in high likelihood high impact quadrant.</desc>
<rect width="480" height="400" fill="#faf9f7"/>
<text x="240" y="24" text-anchor="middle" font-size="12" fill="#1a2744">Likelihood × Impact</text>
<text x="30" y="200" transform="rotate(-90 30,200)" font-size="10">Impact →</text>
<text x="240" y="385" text-anchor="middle" font-size="10">Likelihood →</text>
<g transform="translate(80,50)">
<rect x="0" y="240" width="60" height="60" fill="#2d5a2d" opacity="0.3"/><rect x="60" y="240" width="60" height="60" fill="#6b8e23" opacity="0.5"/>
<rect x="120" y="240" width="60" height="60" fill="#b8860b" opacity="0.6"/><rect x="180" y="240" width="60" height="60" fill="#c45c26" opacity="0.7"/>
<rect x="240" y="240" width="60" height="60" fill="#8b2942" opacity="0.8"/>
<rect x="240" y="180" width="60" height="60" fill="#c45c26"/><rect x="240" y="120" width="60" height="60" fill="#8b2942"/>
<text x="270" y="275" font-size="8" fill="#fff" text-anchor="middle">Escalation</text>
<text x="270" y="155" font-size="8" fill="#fff" text-anchor="middle">Deepfakes</text>
</g>
</svg>
</figure>"""

FIG_PEACE_ROI = """<figure class="journal-figure" id="fig-peace-roi">
<figcaption><span class="figure-label">Figure 7.</span> Peace dividend ROI — prevention investment vs. avoided conflict cost (illustrative).</figcaption>
<svg viewBox="0 0 640 300" role="img" aria-labelledby="fig7-title fig7-desc">
<title id="fig7-title">Peace dividend ROI chart</title>
<desc id="fig7-desc">Bar comparing 160M prevention investment to 100B plus avoided war cost.</desc>
<rect width="640" height="300" fill="#faf9f7"/>
<text x="320" y="24" text-anchor="middle" font-size="13" fill="#1a2744">Prevention ROI (Illustrative)</text>
<rect x="120" y="180" width="80" height="80" fill="#b8860b"/><text x="160" y="275" text-anchor="middle" font-size="10">GDAIC pilots</text><text x="160" y="170" text-anchor="middle" font-size="10">$0.16B</text>
<rect x="380" y="60" width="80" height="200" fill="#1a2744"/><text x="420" y="275" text-anchor="middle" font-size="10">1 war avoided</text><text x="420" y="50" text-anchor="middle" font-size="10">$100B+</text>
<text x="320" y="290" text-anchor="middle" font-size="10" fill="#4a5568">Benefit-cost ratio illustrative: 1:625+ (World Bank framing)</text>
</svg>
</figure>"""

FIG_TIMELINE = """<figure class="journal-figure" id="fig-timeline">
<figcaption><span class="figure-label">Figure 8.</span> GDAIC implementation timeline (2026–2036, illustrative).</figcaption>
<svg viewBox="0 0 640 200" role="img" aria-labelledby="fig8-title fig8-desc">
<title id="fig8-title">Implementation timeline 2026-2036</title>
<desc id="fig8-desc">Timeline from 2026 Envoy appointment through 2036 treaty upgrade path.</desc>
<rect width="640" height="200" fill="#faf9f7"/>
<line x1="40" y1="100" x2="600" y2="100" stroke="#1a2744" stroke-width="3"/>
<circle cx="80" cy="100" r="8" fill="#b8860b"/><text x="80" y="80" text-anchor="middle" font-size="9">2026</text><text x="80" y="130" font-size="8">Envoy</text>
<circle cx="200" cy="100" r="8" fill="#3d5a80"/><text x="200" y="80" font-size="9">2028</text><text x="200" y="130" font-size="8">GDAIC draft</text>
<circle cx="320" cy="100" r="8" fill="#3d5a80"/><text x="320" y="80" font-size="9">2030</text><text x="320" y="130" font-size="8">Pilots eval</text>
<circle cx="440" cy="100" r="8" fill="#1a2744"/><text x="440" y="80" font-size="9">2032</text><text x="440" y="130" font-size="8">Commons</text>
<circle cx="560" cy="100" r="8" fill="#1a2744"/><text x="560" y="80" font-size="9">2036</text><text x="560" y="130" font-size="8">Treaty path</text>
</svg>
</figure>"""

FIGURE_INSERTS = {
    "5.2": FIG_PEACE_ARCHITECTURE,
    "6.3": FIG_CONFLICT_TREND,
    "10.6": FIG_SCENARIO_MATRIX,
    "11.4": FIG_RISK_HEATMAP,
    "13.1": FIG_ECONOMIC_VIOLENCE,
    "13.5": FIG_PEACE_ROI,
    "15.2": FIG_GDAIC_ORG,
    "16.4": FIG_TIMELINE,
    "19.1": FIG_AI_ADOPTION,
}

TABLE_CAPTIONS = {
    "agent roster": "Table 1. Multi-agent deliberative design — expert agent roster (13 domains)",
    "scenario comparison": "Table 2. Scenario comparison matrix — best, moderate, worst, and black swan cases",
    "risk register": "Table 3. Tier 1 risk register — top diplomatic AI risks (illustrative)",
    "economic impact": "Table 4. Economic impact summary — fiscal framework (2026–2035)",
    "humanitarian safeguards": "Table 5. Humanitarian safeguards checklist — operational indicators",
    "gdaic institutional": "Table 6. GDAIC institutional architecture",
    "budget envelope": "Table 7. Budget envelope by implementation phase",
    "me indicators": "Table 8. Monitoring and evaluation indicators — 2030 targets",
    "stakeholder mapping": "Table 9. Stakeholder mapping — interests and engagement mechanisms",
    "dissent matrix": "Table 10. Dissent and disagreement matrix — persistent fault lines",
    "me indicators": "Table 8. Monitoring and evaluation indicators — 2030 targets (orchestrator)",
    "budget envelope": "Table 7. Budget envelope — short-term illustrative (2026–2028)",
}

KEY_TABLE_MARKERS = [
    ("Agent ID", "agent roster"),
    ("Dimension | Best", "scenario comparison"),
    ("Escalation by algorithm", "risk register"),
    ("Phase | Investment", "economic impact"),
    ("Zero use of humanitarian", "humanitarian safeguards"),
    ("Conference of Parties", "gdaic institutional"),
    ("Short (1–2 yr)", "budget envelope"),
    ("de-escalation | Verifiable", "me indicators"),
    ("Stakeholder | Interest", "stakeholder mapping"),
    ("Transparency vs. secrecy", "dissent matrix"),
    ("ID | Label | Target", "me indicators"),
    ("Item | Global estimate", "budget envelope"),
]


def slugify(text: str) -> str:
    t = re.sub(r"^#+\s*", "", text).strip().lower()
    t = re.sub(r"[^\w\s-]", "", t)
    return re.sub(r"\s+", "-", t)


def inline_md(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    return text


def parse_table(lines: list[str], start: int) -> tuple[str, int]:
    rows = []
    i = start
    while i < len(lines) and lines[i].strip().startswith("|"):
        row = [c.strip() for c in lines[i].strip().strip("|").split("|")]
        if not all(re.match(r"^[-:]+$", c.replace(" ", "")) for c in row):
            rows.append(row)
        i += 1
    if not rows:
        return "", start
    thead = rows[0]
    body = rows[1:]
    cap_key = None
    header_join = " | ".join(thead)
    for marker, key in KEY_TABLE_MARKERS:
        if marker in header_join or marker in (body[0][0] if body else ""):
            cap_key = key
            break
    cap = ""
    if cap_key and cap_key in TABLE_CAPTIONS:
        cap = f'<caption class="table-caption">{html.escape(TABLE_CAPTIONS[cap_key])}</caption>'
    out = ['<div class="table-wrap"><table class="journal-table">', cap, "<thead><tr>"]
    for c in thead:
        out.append(f"<th>{inline_md(c)}</th>")
    out.append("</tr></thead><tbody>")
    for row in body:
        out.append("<tr>")
        for c in row:
            out.append(f"<td>{inline_md(c)}</td>")
        out.append("</tr>")
    out.append("</tbody></table></div>")
    return "\n".join(out), i


def briefing_class(h2_text: str, in_section_2: bool = False) -> str | None:
    if not in_section_2:
        return None
    t = h2_text.lower()
    if t.startswith("2.7") or "security council" in t:
        return "briefing-un"
    if t.startswith("2.8") or "regional organization" in t:
        return "briefing-regional"
    if t.startswith("2.9") or "parliamentary" in t:
        return "briefing-fm"
    if t.startswith("2.2") or "next 12 months" in t:
        return "briefing-fm"
    if t.startswith("2.4") or "budget envelope" in t:
        return "briefing-fm"
    if t.startswith("2.1") or "decision you face" in t:
        return "briefing-hos"
    if t.startswith("2.3") or t.startswith("2.5") or t.startswith("2.6"):
        return "briefing-hos"
    return None


BRIEFING_LABELS = {
    "briefing-hos": "Executive Briefing — Heads of State",
    "briefing-fm": "Executive Briefing — Foreign Ministers",
    "briefing-un": "Executive Briefing — UN Principals",
    "briefing-regional": "Executive Briefing — Regional Organizations",
}


def convert_md_to_html(md: str) -> str:
    lines = md.splitlines()
    out: list[str] = []
    i = 0
    in_briefing = False
    in_section_2 = False

    # Skip front matter and cover/TOC blocks handled in template
    while i < len(lines):
        line = lines[i]
        if line.strip() == "---" and i < 10:
            i += 1
            while i < len(lines) and lines[i].strip() != "---":
                i += 1
            i += 1
            continue
        if line.startswith("# COVER PAGE") or line.startswith("# TABLE OF CONTENTS"):
            while i < len(lines) and not re.match(r"^# 1[\.\s]", lines[i]):
                i += 1
            continue
        if line.startswith("# EDITORIAL NOTE"):
            while i < len(lines) and not lines[i].startswith("# 1."):
                i += 1
            continue

        if line.strip().startswith("|"):
            tbl, i = parse_table(lines, i)
            sec = ""
            for j in range(len(out) - 1, max(0, len(out) - 30), -1):
                if 'id="sec-' in out[j]:
                    sec = out[j]
                    break
            sec_id = re.search(r'id="(sec-[^"]+)"', sec)
            sid = sec_id.group(1).replace("sec-", "") if sec_id else ""
            if sid.replace("-", ".") in FIGURE_INSERTS or sid in FIGURE_INSERTS:
                pass  # figures after section headers
            out.append(tbl)
            continue

        if line.startswith("**Visual content recommendation"):
            note = inline_md(line.strip("*").strip())
            out.append(f'<aside class="margin-note" role="note"><span class="margin-label">Visual Recommendation</span><p>{note}</p></aside>')
            i += 1
            continue

        m = re.match(r"^(#{1,4})\s+(.+)$", line)
        if m:
            level = len(m.group(1))
            title = m.group(2).strip()
            sid = slugify(title)
            tag = f"h{min(level, 4)}"
            sec_num = re.match(r"^(\d+(?:\.\d+)*)", title)
            cls = "section-title"
            if level == 1:
                cls += " chapter-title"
            html_title = inline_md(title)

            if in_briefing:
                out.append("</div>")
                in_briefing = False

            if re.match(r"^2[\.\s]", title):
                in_section_2 = True
            elif re.match(r"^3[\.\s]", title) and level == 1:
                in_section_2 = False
                if in_briefing:
                    out.append("</div>")
                    in_briefing = False
            bc = briefing_class(title, in_section_2) if level == 2 else None
            if bc and level == 2:
                briefing_cls = bc
                in_briefing = True
                label = BRIEFING_LABELS.get(bc, "Executive Briefing")
                out.append(f'<div class="executive-briefing {bc}" role="region" aria-label="{html.escape(label)}">')
                out.append(f'<div class="briefing-label">{html.escape(label)}</div>')

            out.append(f'<{tag} id="sec-{sid}" class="{cls}">{html_title}</{tag}>')

            sn = sec_num.group(1) if sec_num else ""
            if sn in FIGURE_INSERTS:
                out.append(FIGURE_INSERTS[sn])
            i += 1
            continue

        if line.strip() == "---":
            out.append('<hr class="section-break"/>')
            i += 1
            continue

        if line.strip().startswith("- ") or line.strip().startswith("* "):
            out.append("<ul>")
            while i < len(lines) and (lines[i].strip().startswith("- ") or lines[i].strip().startswith("* ")):
                item = lines[i].strip()[2:]
                out.append(f"<li>{inline_md(item)}</li>")
                i += 1
            out.append("</ul>")
            continue

        if re.match(r"^\d+\.\s", line.strip()):
            out.append("<ol>")
            while i < len(lines) and re.match(r"^\d+\.\s", lines[i].strip()):
                item = re.sub(r"^\d+\.\s*", "", lines[i].strip())
                out.append(f"<li>{inline_md(item)}</li>")
                i += 1
            out.append("</ol>")
            continue

        if line.strip().startswith(">"):
            out.append("<blockquote>")
            while i < len(lines) and lines[i].strip().startswith(">"):
                out.append(f"<p>{inline_md(lines[i].strip().lstrip('>').strip())}</p>")
                i += 1
            out.append("</blockquote>")
            continue

        if line.strip():
            para = []
            while i < len(lines) and lines[i].strip() and not lines[i].startswith("#") and not lines[i].strip().startswith("|") and not lines[i].strip().startswith("- ") and not lines[i].strip().startswith(">"):
                para.append(lines[i].strip())
                i += 1
            out.append(f"<p>{inline_md(' '.join(para))}</p>")
            continue

        i += 1

    if in_briefing:
        out.append("</div>")
    return "\n".join(out)


def build_toc(md: str) -> str:
    items = []
    for line in md.splitlines():
        m = re.match(r"^#{1,2}\s+(\d+\.?\s*.+)$", line)
        if m and not line.startswith("# COVER"):
            title = m.group(1).strip()
            if title[0].isdigit():
                items.append((title, slugify(title)))
    html_items = []
    for title, sid in items:
        num = re.match(r"^(\d+)", title)
        depth = "toc-chapter" if num else "toc-section"
        html_items.append(f'<li class="{depth}"><a href="#sec-{sid}">{html.escape(title)}</a></li>')
    return "<nav class=\"toc\" aria-label=\"Table of contents\"><h2>Table of Contents</h2><ol>" + "\n".join(html_items) + "</ol></nav>"


def enhanced_markdown(md: str) -> str:
    header = (
        "---\n"
        'title: "AI-Powered Diplomacy and the Architecture of Sustainable Peace"\n'
        'subtitle: "FMS Strategic Review, Volume 1, Issue 1 (2026)"\n'
        'author: "Dr. Fatih Sayin (Editor-in-Chief)"\n'
        'date: "29 May 2026"\n'
        "documentclass: article\n"
        "fontsize: 11pt\n"
        "geometry: margin=1in\n"
        "link-citations: true\n"
        "---\n\n"
    )
    lines = md.splitlines()
    out: list[str] = [header]
    i = 0
    skip_yaml = False
    briefing_open = None
    while i < len(lines):
        line = lines[i]
        if i < 12 and line.strip() == "---":
            skip_yaml = not skip_yaml
            i += 1
            continue
        if skip_yaml:
            i += 1
            continue
        if line.startswith("**Visual content recommendation"):
            note = re.sub(r"^\*\*Visual content recommendation[^:]*:\*\*\s*", "", line)
            out.append(f"\n::: {{.margin-note}}\n**Visual Recommendation.** {note}\n:::\n")
            i += 1
            continue
        hm = re.match(r"^## (2\.\d+.+)$", line)
        if hm:
            if briefing_open:
                out.append("\n:::\n")
            bc = briefing_class(hm.group(1), True)
            if bc:
                out.append(f"\n::: {{.{bc}}}\n")
                out.append(f"**{BRIEFING_LABELS[bc]}**\n\n")
                briefing_open = bc
            else:
                briefing_open = None
        inserts = {
            "## 5.2 The Seven": "\n![Figure 0: FMS Peace Architecture Framework](figures/fms-peace-architecture-framework.svg){#fig:peace-architecture width=90%}\n\n",
            "## 6.3 Quantitative": "\n![Figure 1: Conflict trend (UCDP-style illustrative)](figures/fig-conflict-trend.svg){#fig:conflict-trend width=90%}\n\n",
            "## 10.6 Scenario": "\n![Figure 3: Scenario probability matrix](figures/fig-scenario-matrix.svg){#fig:scenarios}\n\n",
            "## 13.1 Macro": "\n![Figure 2: Economic cost of violence](figures/fig-economic-violence.svg){#fig:economic-violence}\n\n",
            "## 15.2 Institutional": "\n![Figure 5: GDAIC governance structure](figures/fig-gdaic-org.svg){#fig:gdaic-org}\n\n",
            "## 11.4 Risk Interaction": "\n![Figure 6: Risk heat map](figures/fig-risk-heatmap.svg){#fig:risk-heatmap}\n\n",
            "## 13.5 Fiscal": "\n![Figure 7: Peace dividend ROI](figures/fig-peace-roi.svg){#fig:peace-roi}\n\n",
            "## 16.4 Timeline": "\n![Figure 8: Implementation timeline](figures/fig-timeline.svg){#fig:timeline}\n\n",
            "## 19.1 2030": "\n![Figure 4: AI adoption projection](figures/fig-ai-adoption.svg){#fig:ai-adoption}\n\n",
        }
        for key, block in inserts.items():
            if line.startswith(key):
                out.append(block)
                break
        caps = {
            "Agent ID": ": Table 1 — Expert agent roster (13 domains) {#tbl-agents}\n\n",
            "Dimension | Best": ": Table 2 — Scenario comparison matrix {#tbl-scenarios}\n\n",
            "Escalation by algorithm": ": Table 3 — Tier 1 risk register {#tbl-risks}\n\n",
            "Phase | Investment": ": Table 4 — Economic impact / fiscal framework {#tbl-economic}\n\n",
            "Conference of Parties": ": Table 6 — GDAIC institutional design {#tbl-gdaic}\n\n",
            "Stakeholder | Interest": ": Table 9 — Stakeholder mapping {#tbl-stakeholders}\n\n",
            "Transparency vs. secrecy": ": Table 10 — Dissent and disagreement matrix {#tbl-dissent}\n\n",
        }
        if line.strip().startswith("|"):
            for marker, cap in caps.items():
                if marker in line:
                    out.append(cap)
                    break
        out.append(line)
        i += 1
    if briefing_open:
        out.append("\n:::\n")
    return "\n".join(out)


RISK_REGISTER_TABLE = """
<div class="table-wrap"><table class="journal-table" id="tbl-risk-register">
<caption class="table-caption">Table 3. Risk register — top diplomatic AI risks (illustrative, consolidated from Sections 8.1–8.3)</caption>
<thead><tr><th>#</th><th>Risk</th><th>Tier</th><th>Severity</th><th>Probability</th><th>Mitigation</th></tr></thead>
<tbody>
<tr><td>1</td><td>Escalation by algorithm (false-positive alerts)</td><td>1</td><td>High</td><td>Medium-High</td><td>Cooling-off periods; human-in-loop</td></tr>
<tr><td>2</td><td>Synthetic information warfare</td><td>1</td><td>High</td><td>Medium-High</td><td>Provenance standards; debunking networks</td></tr>
<tr><td>3</td><td>Norm collapse (unilateral diplomatic AI)</td><td>1</td><td>High</td><td>Medium</td><td>GDAIC; UN registry</td></tr>
<tr><td>4</td><td>Bias in preventive models</td><td>2</td><td>Medium-High</td><td>Medium</td><td>Inclusive training data review</td></tr>
<tr><td>5</td><td>Sanctions AI humanitarian harm</td><td>2</td><td>High</td><td>Medium</td><td>Economic rights impact review</td></tr>
<tr><td>6</td><td>Climate-security securitization</td><td>2</td><td>Medium</td><td>Medium</td><td>IPCC-aligned validation</td></tr>
<tr><td>7</td><td>Vendor lock-in and espionage</td><td>3</td><td>Medium</td><td>High</td><td>Open APIs; diverse registry</td></tr>
<tr><td>8</td><td>Weak accountability and remedy</td><td>3</td><td>High</td><td>Medium</td><td>Independent Review Panel</td></tr>
<tr><td>9</td><td>Space-cyber cross-domain escalation</td><td>3</td><td>High</td><td>Low-Medium</td><td>Incident notification register</td></tr>
<tr><td>10</td><td>Humanitarian data weaponization</td><td>2</td><td>High</td><td>Medium</td><td>ICRC firewalls</td></tr>
<tr><td>11</td><td>Deepfake casus belli (black swan)</td><td>1</td><td>Existential</td><td>Low</td><td>Cryptographic signing of leader comms</td></tr>
<tr><td>12</td><td>Diplomatic bandwidth inequality</td><td>2</td><td>Medium</td><td>High</td><td>LDC fee waivers; capacity funds</td></tr>
</tbody></table></div>
"""

HUMANITARIAN_CHECKLIST_TABLE = """
<div class="table-wrap"><table class="journal-table" id="tbl-humanitarian">
<caption class="table-caption">Table 5. Humanitarian safeguards checklist — operational indicators (Section 11.4)</caption>
<thead><tr><th>#</th><th>Indicator</th><th>Requirement</th></tr></thead>
<tbody>
<tr><td>1</td><td>Beneficiary database use</td><td>Zero security-classified training without legal basis and oversight</td></tr>
<tr><td>2</td><td>Access negotiation cycles</td><td>Documented reduction in pilot zones</td></tr>
<tr><td>3</td><td>Aid worker attacks</td><td>No quarterly increase correlated with risk-corridor tools</td></tr>
<tr><td>4</td><td>Refugee and IDP consultation</td><td>Required in asylum-affecting tools</td></tr>
<tr><td>5</td><td>Humanitarian-intelligence firewall</td><td>Technical and legal separation mandatory</td></tr>
<tr><td>6</td><td>HRIA before procurement</td><td>ICRC/OCHA-aligned template within 18 months of GDAIC</td></tr>
<tr><td>7</td><td>Aggregated geolocation in diplomatic maps</td><td>Delayed vs. operational humanitarian versions</td></tr>
<tr><td>8</td><td>Independence of evaluators</td><td>Third-party, not vendor self-certification</td></tr>
</tbody></table></div>
"""


def extract_editorial(md: str) -> str:
    m = re.search(r"# EDITORIAL NOTE\n\n(.*?)\n\n---", md, re.DOTALL)
    if not m:
        return ""
    text = m.group(1)
    paras = []
    for block in text.split("\n\n"):
        block = block.strip()
        if not block:
            continue
        if block.startswith("*") and block.endswith("*"):
            paras.append(f"<p class=\"editorial-sig\"><em>{inline_md(block.strip('*'))}</em></p>")
        else:
            paras.append(f"<p>{inline_md(block)}</p>")
    return "\n".join(paras)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Optional legacy HTML export (Markdown is canonical).")
    p.add_argument(
        "--html",
        action="store_true",
        help="Generate deprecated HTML editions (default: no HTML output)",
    )
    p.add_argument(
        "--journal-md",
        action="store_true",
        help="Also write reports/FMS-Strategic-Review-Journal.md (Pandoc-oriented)",
    )
    p.add_argument(
        "--html-out-dir",
        type=Path,
        default=None,
        help="Directory for index.html output (default: publication/_archived)",
    )
    return p.parse_args()


def main():
    args = parse_args()
    if not args.html and not args.journal_md:
        print("Canonical source:", SRC)
        print("HTML export disabled by default. Use --html for legacy browser editions.")
        print("Use --journal-md to refresh Pandoc-oriented journal markdown.")
        return

    if not SRC.is_file():
        print(f"Source not found: {SRC}", file=sys.stderr)
        sys.exit(1)

    md = SRC.read_text(encoding="utf-8")
    body = convert_md_to_html(md)
    body = body.replace(
        '<h2 id="sec-81-tier-1--existential--systemic"',
        RISK_REGISTER_TABLE + '<h2 id="sec-81-tier-1--existential--systemic"',
        1,
    )
    body = body.replace(
        '<h2 id="sec-114-operational-indicators"',
        HUMANITARIAN_CHECKLIST_TABLE + '<h2 id="sec-114-operational-indicators"',
        1,
    )
    toc = build_toc(md)
    editorial_html = extract_editorial(md)

    html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>AI-Powered Diplomacy and the Architecture of Sustainable Peace | FMS Strategic Review Flagship Vol. 1, Iss. 1</title>
<link rel="stylesheet" href="{CSS_LINK}"/>
</head>
<body class="journal-body">
<header class="running-header" aria-hidden="true">
<span class="run-left">FMS Strategic Review</span>
<span class="run-center">Vol. 1, Iss. 1 (2026)</span>
<span class="run-right">Sayin (Ed.)</span>
</header>
<footer class="running-footer" aria-hidden="true">
<span class="run-left">Building Peace Through Intelligence, Diplomacy, and Human Dignity</span>
<span class="run-right"><span class="page-number"></span></span>
</footer>

<article class="journal-article">
<section class="cover-page" id="cover">
<p class="series-brand">FMS STRATEGIC REVIEW</p>
<p class="volume-issue">Volume 1, Issue 1 | 2026</p>
<hr class="cover-rule"/>
<h1 class="cover-title">AI-Powered Diplomacy and the Architecture of Sustainable Peace</h1>
<p class="cover-subtitle">How Artificial Intelligence Can Strengthen Preventive Diplomacy, Multilateral Governance, and Human Dignity in an Age of Accelerating Conflict Risk</p>
<hr class="cover-rule"/>
<p class="cover-meta"><strong>Editor-in-Chief:</strong> Dr. Fatih Sayin</p>
<p class="cover-meta"><strong>Institution:</strong> FMS Expert Agents Think Tank</p>
<p class="cover-meta"><strong>Publication Date:</strong> 29 May 2026</p>
<p class="cover-meta"><strong>Classification:</strong> Public policy research</p>
<p class="cover-citation">Suggested citation: Sayin, F. (Ed.). (2026). <em>AI-powered diplomacy and the architecture of sustainable peace</em> (FMS Strategic Review, Vol. 1, Iss. 1). FMS Expert Agents.</p>
</section>

<section class="editorial-note page-break-before" id="editorial">
<h2>Editorial Note</h2>
{editorial_html}
</section>

{toc}

<main class="journal-main">
{body}
</main>
</article>
</body>
</html>"""

    html_out = args.html_out_dir or (OUT / "_archived")
    html_out.mkdir(parents=True, exist_ok=True)

    if args.html:
        (html_out / "index.html").write_text(html_doc, encoding="utf-8")
        (html_out / "index-flagship.html").write_text(html_doc, encoding="utf-8")
        print(f"Wrote {html_out / 'index.html'} (deprecated)")
        print(f"Wrote {html_out / 'index-flagship.html'} (deprecated)")

    if args.journal_md:
        (ROOT / "reports" / "FMS-Strategic-Review-Journal.md").write_text(
            enhanced_markdown(md), encoding="utf-8"
        )
        print("Wrote reports/FMS-Strategic-Review-Journal.md")

    if not args.html:
        return

    meta = """---
title: "AI-Powered Diplomacy and the Architecture of Sustainable Peace"
subtitle: "FMS Strategic Review, Volume 1, Issue 1 (2026)"
author:
  - name: "Dr. Fatih Sayin"
    role: "Editor-in-Chief"
date: "29 May 2026"
lang: en-US
documentclass: article
papersize: letter
fontsize: 11pt
geometry: margin=1in
linestretch: 1.15
mainfont: "Times New Roman"
sansfont: "Arial"
colorlinks: true
link-citations: true
toc: true
toc-depth: 3
numbersections: true
header-includes:
  - \\usepackage{fancyhdr}
  - \\pagestyle{fancy}
  - \\fancyhead[L]{FMS Strategic Review}
  - \\fancyhead[C]{Vol.\\ 1, Iss.\\ 1 (2026)}
  - \\fancyhead[R]{Sayin (Ed.)}
---

"""
    (OUT / "metadata.yaml").write_text(meta, encoding="utf-8")

    fig_dir = OUT / "figures"
    fig_dir.mkdir(exist_ok=True)
    for fname, svg_html in [
        ("fig-conflict-trend.svg", FIG_CONFLICT_TREND),
        ("fig-economic-violence.svg", FIG_ECONOMIC_VIOLENCE),
        ("fig-scenario-matrix.svg", FIG_SCENARIO_MATRIX),
        ("fig-ai-adoption.svg", FIG_AI_ADOPTION),
        ("fig-gdaic-org.svg", FIG_GDAIC_ORG),
        ("fig-risk-heatmap.svg", FIG_RISK_HEATMAP),
        ("fig-peace-roi.svg", FIG_PEACE_ROI),
        ("fig-timeline.svg", FIG_TIMELINE),
    ]:
        m = re.search(r"(<svg.*?</svg>)", svg_html, re.DOTALL)
        if m:
            (fig_dir / fname).write_text(m.group(1), encoding="utf-8")

    print(f"Exported {len(list(fig_dir.glob('*.svg')))} figures to {fig_dir}")


if __name__ == "__main__":
    main()
