import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Donation Cancelled | FMS Think Tank",
  description: "Your donation checkout was cancelled.",
};

export default function DonateCancelPage() {
  return (
    <div className="donate-status-card">
      <h1 className="donate-status-title">Checkout cancelled</h1>
      <p className="donate-status-copy">
        No payment was processed. You can return to the donation page to choose a different
        amount or try again when you are ready.
      </p>
      <div className="donate-status-actions">
        <Link href="/donate" className="donate-primary-link">
          Back to donate
        </Link>
        <Link href="https://fmsthinktank.org/" className="donate-secondary-link">
          Return to FMS Think Tank
        </Link>
      </div>
    </div>
  );
}
