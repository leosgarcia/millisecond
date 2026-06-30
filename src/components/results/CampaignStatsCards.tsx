type CampaignStat = {
  label: string
  value: string | number
  detail?: string
  tone?: 'speed' | 'budget' | 'performance' | 'telemetry' | 'warning'
}

const TONE_CLASS: Record<NonNullable<CampaignStat['tone']>, string> = {
  speed: 'border-[var(--accent-speed)]',
  budget: 'border-[var(--accent-budget)]',
  performance: 'border-[var(--accent-performance)]',
  telemetry: 'border-[var(--accent-telemetry)]',
  warning: 'border-[var(--accent-warning)]',
}

export default function CampaignStatsCards({ stats }: { stats: CampaignStat[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`min-h-[108px] border border-[var(--border-subtle)] bg-[var(--background-card)] p-4 ${TONE_CLASS[stat.tone ?? 'telemetry']} border-t-2`}
        >
          <div className="mb-2 text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
            {stat.label}
          </div>
          <div className="text-2xl font-mono uppercase tracking-tight text-[var(--text-main)]">
            {stat.value ?? '—'}
          </div>
          {stat.detail && (
            <div className="mt-2 text-xs font-mono uppercase tracking-[0.25em] text-[var(--text-muted)]">
              {stat.detail}
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
