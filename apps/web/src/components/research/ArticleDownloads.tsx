"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Printer } from "lucide-react";

type Props = {
  contentSlug: string;
};

export function ArticleDownloads({ contentSlug }: Props) {
  const docxHref = `/research/${contentSlug}.docx`;
  const mdHref = `/research/${contentSlug}.md`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Downloads
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild variant="outline" size="sm" className="justify-start">
          <a href={docxHref} download>
            <Download className="mr-2 h-4 w-4" aria-hidden />
            Download DOCX
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="justify-start">
          <a href={mdHref} download>
            <FileText className="mr-2 h-4 w-4" aria-hidden />
            Download Markdown
          </a>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="justify-start"
          onClick={() => window.print()}
        >
          <Printer className="mr-2 h-4 w-4" aria-hidden />
          Print article
        </Button>
      </CardContent>
    </Card>
  );
}
