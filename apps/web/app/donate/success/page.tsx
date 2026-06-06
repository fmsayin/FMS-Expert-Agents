import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You | FMS Think Tank",
  description: "Thank you for supporting FMS Think Tank.",
};

export default function DonateSuccessPage() {
  return (
    <div className="donate-status-card">
      <h1 className="donate-status-title">Thank you for your support</h1>
      <p className="donate-status-copy">
        Your donation helps FMS advance research and analysis on peace, diplomacy, and
        responsible AI governance. A receipt from Stripe has been sent to the email address
        you provided at checkout.
      </p>
      <div className="donate-status-actions">
        <Link href="https://fmsthinktank.org/" className="donate-primary-link">
          Return to FMS Think Tank
        </Link>
        <Link href="/donate" className="donate-secondary-link">
          Make another donation
        </Link>
      </div>
    </div>
  );
}
