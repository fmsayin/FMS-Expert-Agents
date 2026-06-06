import "server-only";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default as (
    data: Buffer,
  ) => Promise<{ text: string }>;
  const result = await pdfParse(buffer);
  return result.text?.trim() ?? "";
}
