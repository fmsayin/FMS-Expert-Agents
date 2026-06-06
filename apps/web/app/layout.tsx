import type { Metadata } from "next";
import { Inter, Libre_Baskerville, Playfair_Display, Source_Serif_4 } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
});

const FAVICON_VERSION = "2";

export const metadata: Metadata = {
  title: "FMS Expert Agents",
  description: "Building Peace Through Intelligence, Diplomacy, and Human Dignity",
  icons: {
    icon: [
      { url: `/favicon.ico?v=${FAVICON_VERSION}`, sizes: "any" },
      { url: `/favicon-16x16.png?v=${FAVICON_VERSION}`, sizes: "16x16", type: "image/png" },
      { url: `/favicon-32x32.png?v=${FAVICON_VERSION}`, sizes: "32x32", type: "image/png" },
      { url: `/favicon-48x48.png?v=${FAVICON_VERSION}`, sizes: "48x48", type: "image/png" },
    ],
    apple: `/apple-touch-icon.png?v=${FAVICON_VERSION}`,
  },
  manifest: `/site.webmanifest?v=${FAVICON_VERSION}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} ${playfair.variable} ${libreBaskerville.variable}`}
    >
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
