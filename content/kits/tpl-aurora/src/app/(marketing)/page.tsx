import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "R$ 49",
    period: "/mês",
    features: ["1 workspace", "3 membros", "Suporte por e-mail"],
  },
  {
    name: "Pro",
    price: "R$ 149",
    period: "/mês",
    features: ["Workspaces ilimitados", "SSO", "Suporte prioritário"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    features: ["SLA 99.9%", "Onboarding dedicado", "Contrato custom"],
  },
];

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--aurora-brand)]">
          Aurora SaaS Kit
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Lance seu SaaS em dias, não meses
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--aurora-muted)]">
          Landing, pricing, dashboard e auth prontos. Troque os tokens, o copy e
          o provedor de login — o resto já está no lugar.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-[var(--aurora-radius)] bg-[var(--aurora-brand)] px-5 py-3 text-sm font-medium text-white shadow-[var(--aurora-shadow)]"
          >
            Ver planos
          </Link>
          <Link
            href="/app"
            className="rounded-[var(--aurora-radius)] border border-[var(--aurora-border)] px-5 py-3 text-sm font-medium"
          >
            Abrir dashboard
          </Link>
        </div>
      </section>

      <section id="pricing" className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-2xl border p-6 text-left ${
              plan.highlighted
                ? "border-[var(--aurora-brand)] bg-[var(--aurora-brand-soft)]"
                : "border-[var(--aurora-border)] bg-[var(--aurora-surface)]"
            }`}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--aurora-muted)]">
              {plan.name}
            </h2>
            <p className="mt-3 text-3xl font-semibold">
              {plan.price}
              <span className="text-base font-normal text-[var(--aurora-muted)]">
                {plan.period}
              </span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[var(--aurora-muted)]">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}