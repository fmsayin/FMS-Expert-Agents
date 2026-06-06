import type { Metadata } from "next";
import Link from "next/link";

import "@/styles/donate.css";

export const metadata: Metadata = {
  title: "Donate | FMS Think Tank",
  description:
    "Support the Foundation for Multilateral Strategies with a secure donation.",
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="donate-shell">
      <header className="donate-header">
        <div className="donate-header-inner">
          <Link href="https://fmsthinktank.org/" className="donate-brand">
            <span className="donate-brand-mark" aria-hidden>
              FMS
            </span>
            <span>FMS Think Tank</span>
          </Link>
          <Link href="https://fmsthinktank.org/" className="donate-back-link">
            Back to site
          </Link>
        </div>
      </header>
      <main className="donate-main">{children}</main>
    </div>
  );
}
