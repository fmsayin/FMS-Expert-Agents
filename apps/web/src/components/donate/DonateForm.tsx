"use client";

import { useState } from "react";
import { toast } from "sonner";

const PRESET_AMOUNTS = [10, 25, 50, 100] as const;

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function DonateForm() {
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(25);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resolveAmountCents = (): number | null => {
    if (selectedPreset === "custom") {
      const parsed = Number.parseFloat(customAmount.replace(/,/g, ""));
      if (!Number.isFinite(parsed) || parsed <= 0) return null;
      return Math.round(parsed * 100);
    }
    return selectedPreset * 100;
  };

  const handleDonate = async () => {
    setError(null);
    const amountCents = resolveAmountCents();

    if (amountCents === null) {
      setError("Enter a valid custom amount.");
      return;
    }

    if (amountCents < 50) {
      setError("Minimum donation is $0.50.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        const message = data.error ?? "Unable to start checkout. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      window.location.href = data.url;
    } catch {
      const message = "Network error. Please check your connection and try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donate-card">
      <h2 className="donate-section-title">Choose an amount</h2>
      <div className="donate-amount-grid">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`donate-amount-btn${selectedPreset === amount ? " is-selected" : ""}`}
            onClick={() => {
              setSelectedPreset(amount);
              setError(null);
            }}
            aria-pressed={selectedPreset === amount}
          >
            {formatUsd(amount)}
          </button>
        ))}
      </div>

      <div className="donate-custom-row">
        <button
          type="button"
          className={`donate-amount-btn${selectedPreset === "custom" ? " is-selected" : ""}`}
          onClick={() => {
            setSelectedPreset("custom");
            setError(null);
          }}
          aria-pressed={selectedPreset === "custom"}
        >
          Custom Amount
        </button>
        {selectedPreset === "custom" && (
          <div className="donate-custom-input-wrap">
            <label className="donate-label" htmlFor="donate-custom-amount">
              Enter amount (USD)
            </label>
            <input
              id="donate-custom-amount"
              className="donate-input"
              inputMode="decimal"
              placeholder="0.00"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
            />
          </div>
        )}
      </div>

      {error ? (
        <p className="donate-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        className="donate-submit"
        onClick={() => void handleDonate()}
        disabled={loading}
      >
        {loading ? "Redirecting to secure checkout…" : "Continue to secure checkout"}
      </button>
      <p className="donate-secured">Secured and powered by Stripe</p>
    </div>
  );
}
