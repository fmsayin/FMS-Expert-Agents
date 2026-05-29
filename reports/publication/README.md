# FMS Strategic Review — Publication Assets (HTML deprecated)

**Volume 1, Issue 1 (2026)** · Editor: Dr. Fatih Sayin

**Official author/editor name:** Dr. Fatih Sayin

## Official source (canonical)

The **official flagship publication** is a single Markdown file:

**[`../FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md`](../FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md)**

View it in GitHub, VS Code, or any Markdown preview. Regenerate from base + supplements:

```powershell
python reports/build_flagship.py
```

## HTML journal edition — deprecated

Browser HTML editions (`index.html`, `index-flagship.html`) are **deprecated** as of May 2026. Archived copies live in [`_archived/`](./_archived/). Do not use HTML as the publication source of truth.

`build_publication.py` remains for optional legacy HTML export only (`--html` flag). **HTML generation is disabled by default.**

## This folder

| Path | Purpose |
|------|---------|
| `figures/*.svg` | Legacy chart assets (optional; diagrams in canonical MD use Mermaid) |
| `styles/journal.css` | Legacy HTML styling only |
| `metadata.yaml` | Optional Pandoc metadata for PDF experiments |
| `build_publication.py` | Optional legacy HTML builder (off by default) |
| `FMS-Strategic-Review.tex` | Optional LaTeX wrapper for Pandoc PDF |
| `_archived/` | Deprecated `index.html` and `index-flagship.html` |

## Optional: Pandoc PDF from canonical Markdown

Requires [Pandoc](https://pandoc.org/) and a LaTeX engine (e.g. MiKTeX):

```powershell
cd "c:\Users\fmsay\Documents\FMS_Expert Agents\reports"
pandoc FMS-Strategic-Review-AI-Diplomacy-Peace-Publication.md `
  --metadata-file=publication/metadata.yaml `
  -o publication/FMS-Strategic-Review.pdf `
  --pdf-engine=xelatex `
  -V mainfont="Times New Roman" `
  --toc `
  --number-sections
```

## Citation

Sayin, F. (Ed.). (2026). *AI-powered diplomacy and the architecture of sustainable peace* (FMS Strategic Review, Vol. 1, Iss. 1). FMS Expert Agents.
