export type DiagnosisCard = {
  title: string
  body: string
  eyebrow?: string
}

export default function TechnicalDiagnosisPanel({
  title,
  cards,
}: {
  title: string
  cards: DiagnosisCard[]
}) {
  return (
    <section className="border border-[var(--border-subtle)] bg-[var(--background-card)] p-4">
      <div className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
        {title}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="border border-[var(--border-subtle)] bg-[var(--background-panel)] p-3">
            <div className="mb-2 h-1 w-10 bg-[var(--accent-telemetry)]" />
            <div className="mb-2 text-sm font-mono uppercase tracking-widest text-[var(--text-main)]">
              {card.title}
            </div>
            <div className="text-xs leading-relaxed text-[var(--text-muted)]">
              {card.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
