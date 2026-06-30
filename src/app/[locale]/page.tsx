import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import AppShell from '@/components/ui/AppShell'

export default function LandingPage() {
  const t = useTranslations('Landing')

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-[var(--text-main)] mb-6 max-w-3xl">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-12">
          {t('subtitle')}
        </p>

        <Link href="/draft" className="button-primary px-8 py-4 text-lg">
          {t('cta')}
        </Link>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl border-t border-[var(--border-subtle)] pt-12">
          <div>
            <h2 className="text-sm font-mono text-[var(--accent-telemetry)] uppercase tracking-widest mb-4">
              {t('howItWorks')}
            </h2>
            <ul className="space-y-3 text-sm text-[var(--text-muted)] font-mono">
              <li className="flex gap-3"><span className="text-[var(--accent-speed)]">01.</span> {t('step1')}</li>
              <li className="flex gap-3"><span className="text-[var(--accent-speed)]">02.</span> {t('step2')}</li>
              <li className="flex gap-3"><span className="text-[var(--accent-speed)]">03.</span> {t('step3')}</li>
              <li className="flex gap-3"><span className="text-[var(--accent-speed)]">04.</span> {t('step4')}</li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-mono text-[var(--accent-performance)] uppercase tracking-widest mb-4">
              {t('noRandomness')}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed font-mono">
              {t('engineDesc')}
            </p>
            <div className="mt-4">
              <a href="/docs" className="text-xs text-[var(--accent-telemetry)] uppercase font-mono tracking-wider hover:underline">
                {t('methodology')} &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
