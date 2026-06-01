import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailView } from "@/components/research/ArticleDetailView";
import { getArticleSlugs, getResearchOutputBySlug } from "@/data/research-outputs";
import { loadArticleMarkdown } from "@/lib/research-content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const output = getResearchOutputBySlug(slug);
  if (!output) return { title: "Research Output" };
  return {
    title: output.title,
    description: output.summary,
    authors: output.author ? [{ name: output.author }] : undefined,
  };
}

export default async function ResearchArticlePage({ params }: Props) {
  const { slug } = await params;
  const output = getResearchOutputBySlug(slug);
  if (!output?.contentSlug) notFound();

  const markdown = await loadArticleMarkdown(output.contentSlug);

  return <ArticleDetailView output={output} markdown={markdown} />;
}
