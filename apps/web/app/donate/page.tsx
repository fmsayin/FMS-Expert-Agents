import { DonateForm } from "@/components/donate/DonateForm";

export default function DonatePage() {
  return (
    <>
      <header className="donate-hero">
        <p className="donate-eyebrow">Support Us</p>
        <h1 className="donate-title">Donate to FMS Think Tank</h1>
        <p className="donate-lead">
          Your contribution advances independent research on peace, diplomacy, AI governance,
          and multilateral strategy. Choose an amount below to continue to our secure Stripe
          checkout.
        </p>
      </header>
      <DonateForm />
    </>
  );
}
