#!/usr/bin/env python3
"""Assemble official FMS Strategic Review publication from base markdown + supplements.

Canonical output: reports/FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md
Base (pre-supplement sections): reports/flagship-supplements/base-publication.md
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "reports" / "flagship-supplements" / "base-publication.md"
SUPP = ROOT / "reports" / "flagship-supplements"
OUT = ROOT / "reports" / "FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md"


def word_count(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text))


def load(name: str) -> str:
    return (SUPP / name).read_text(encoding="utf-8")


def extract_section(md: str, start_pat: str, end_pat: str | None) -> tuple[str, str, str]:
    """Return (before, section, after)."""
    m = re.search(start_pat, md, re.MULTILINE)
    if not m:
        raise ValueError(f"Start not found: {start_pat}")
    start = m.start()
    if end_pat:
        m2 = re.search(end_pat, md[m.end() :], re.MULTILINE)
        if not m2:
            raise ValueError(f"End not found after {start_pat}")
        end = m.end() + m2.start()
    else:
        end = len(md)
    return md[:start], md[start:end], md[end:]


def renumber_headings(block: str, old_major: int, new_major: int) -> str:
    block = re.sub(
        rf"^# {old_major}\.",
        f"# {new_major}.",
        block,
        count=1,
        flags=re.MULTILINE,
    )
    block = re.sub(
        rf"^## {old_major}\.",
        lambda m: f"## {new_major}." + m.group(0).split(".", 1)[1],
        block,
        flags=re.MULTILINE,
    )
    return block


def main():
    md = SRC.read_text(encoding="utf-8")
    md = re.sub(r"\*End of publication.*$", "", md, flags=re.DOTALL).strip()

    framework = load("section-framework.md")
    author = load("section-author-perspective.md")
    regional = load("section-regional-policy.md")
    roadmap = load("section-implementation-expanded.md")
    vision = load("section-vision-2050.md")
    citation_log = load("appendix-citation-log.md")

    # Split major blocks
    before_lit, lit, after_lit = extract_section(
        md, r"^# 4\. LITERATURE REVIEW", r"^# 5\. FINDINGS"
    )
    _, findings, after_findings = extract_section(
        after_lit, r"^# 5\. FINDINGS", r"^# 6\. AGENT"
    )
    _, agents, after_agents = extract_section(
        after_findings, r"^# 6\. AGENT", r"^# 7\. SCENARIO"
    )
    _, scenarios, after_scenarios = extract_section(
        after_agents, r"^# 7\. SCENARIO", r"^# 8\. RISK ASSESSMENT"
    )
    _, risk, after_risk = extract_section(
        after_scenarios, r"^# 8\. RISK", r"^# 9\. RISKS AND CRITICISMS"
    )
    _, criticisms, after_crit = extract_section(
        after_risk, r"^# 9\. RISKS", r"^# 10\. ECONOMIC"
    )
    _, economic, after_econ = extract_section(
        after_crit, r"^# 10\. ECONOMIC", r"^# 11\. HUMANITARIAN"
    )
    _, humanitarian, after_hum = extract_section(
        after_econ, r"^# 11\. HUMANITARIAN", r"^# 12\. GOVERNANCE"
    )
    _, governance, after_gov = extract_section(
        after_hum, r"^# 12\. GOVERNANCE", r"^# 13\. RECOMMENDATIONS"
    )
    _, _old_impl, after_impl = extract_section(
        after_gov, r"^# 13\. RECOMMENDATIONS", r"^# 14\. FUTURE OUTLOOK"
    )
    _, outlook, after_outlook = extract_section(
        after_impl, r"^# 14\. FUTURE", r"^# 15\. CONCLUSION"
    )
    _, conclusion, after_concl = extract_section(
        after_outlook, r"^# 15\. CONCLUSION", r"^# 16\. REFERENCES"
    )
    _, references, after_refs = extract_section(
        after_concl, r"^# 16\. REFERENCES", r"^# 17\. APPENDICES"
    )
    _, appendices, _ = extract_section(after_refs, r"^# 17\. APPENDICES", None)

    # Renumber extracted blocks
    findings = renumber_headings(findings, 5, 6)
    agents = renumber_headings(agents, 6, 7)
    scenarios = renumber_headings(scenarios, 7, 10)
    risk = renumber_headings(risk, 8, 11)
    criticisms = renumber_headings(criticisms, 9, 12)
    economic = renumber_headings(economic, 10, 13)
    humanitarian = renumber_headings(humanitarian, 11, 14)
    governance = renumber_headings(governance, 12, 15)
    outlook = renumber_headings(outlook, 14, 19)
    conclusion = renumber_headings(conclusion, 15, 20)
    references = renumber_headings(references, 16, 21)
    appendices = renumber_headings(appendices, 17, 22)

    toc_block = """# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)  
2. [Executive Briefing for Decision-Makers](#2-executive-briefing-for-decision-makers)  
3. [Research Methodology](#3-research-methodology)  
4. [Literature Review](#4-literature-review)  
5. [FMS Peace Architecture Framework™](#5-fms-peace-architecture-framework)  
6. [Findings: Cross-Cutting Analysis](#6-findings-cross-cutting-analysis)  
7. [Agent Deliberations](#7-agent-deliberations)  
8. [Author's Perspective](#8-authors-perspective)  
9. [Regional Policy Analysis](#9-regional-policy-analysis)  
10. [Scenario Analysis](#10-scenario-analysis)  
11. [Risk Assessment](#11-risk-assessment)  
12. [Risks and Criticisms: Scholarly Debate](#12-risks-and-criticisms-scholarly-debate)  
13. [Economic Impact](#13-economic-impact)  
14. [Humanitarian Impact](#14-humanitarian-impact)  
15. [Governance Framework](#15-governance-framework)  
16. [Implementation Roadmap](#16-implementation-roadmap)  
17. [Recommendations](#17-recommendations)  
18. [FMS Vision 2050](#18-fms-vision-2050)  
19. [Future Outlook: 2030, 2040, 2050](#19-future-outlook-2030-2040-2050)  
20. [Conclusion](#20-conclusion)  
21. [References](#21-references)  
22. [Appendices](#22-appendices)  

"""

  # Header through literature (sections 1-4)
    header_end = md.find("# 4. LITERATURE REVIEW")
    header = md[:header_end]

    header = re.sub(
        r"# TABLE OF CONTENTS\n\n.*?\n\n---",
        toc_block + "\n---",
        header,
        count=1,
        flags=re.DOTALL,
    )
    header = header.replace(
        'word_target: "15,000–20,000"',
        'word_target: "18,000–25,000"',
    )
    header = header.replace(
        "**Pages:** Approx. 90 (print equivalent)",
        "**Pages:** Approx. 120 (print equivalent)",
    )
    if "canonical: true" not in header:
        header = header.replace(
            'date: "29 May 2026"',
            'date: "29 May 2026"\ncanonical: true\nofficial_source: "reports/FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md"',
            1,
        )

    # Add framework reference to executive summary area
    header = header.replace(
        "The Global Diplomatic AI Compact translates these into institutional form",
        "The FMS Peace Architecture Framework™ and Global Diplomatic AI Compact translate these into institutional form",
    )

    flagship = "\n\n".join(
        [
            header.rstrip(),
            lit.strip(),
            framework.strip(),
            findings.strip(),
            agents.strip(),
            author.strip(),
            regional.strip(),
            scenarios.strip(),
            risk.strip(),
            criticisms.strip(),
            economic.strip(),
            humanitarian.strip(),
            governance.strip(),
            roadmap.strip(),
            vision.strip(),
            outlook.strip(),
            conclusion.strip(),
            references.strip(),
            appendices.strip(),
            citation_log.strip(),
            "\n---\n\n*End of FMS Strategic Review, Volume 1, Issue 1 (2026). Official publication: `reports/FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md`. Editor: Dr. Fatih Sayin.*",
        ]
    )

    OUT.write_text(flagship, encoding="utf-8")
    wc = word_count(flagship)
    print(f"Wrote {OUT}")
    print(f"Word count: {wc}")


if __name__ == "__main__":
    main()
