import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const proseClass =
  "prose prose-slate max-w-none font-serif text-foreground prose-headings:font-sans prose-headings:text-primary prose-headings:scroll-mt-20 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-gold prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-th:bg-muted prose-th:text-foreground prose-strong:text-foreground";

export function ArticleMarkdown({ markdown }: { markdown: string }) {
  return (
    <article className={proseClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  );
}
