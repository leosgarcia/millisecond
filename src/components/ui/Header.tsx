'use client'

import LanguageSwitcher from './LanguageSwitcher'
import { Link } from '@/i18n/routing'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function Header() {
  const pathname = usePathname()
  const t = useTranslations('Header')
  
  let step = 0
  if (pathname.includes('/draft')) step = 1
  if (pathname.includes('/simulate')) step = 2

  return (
    <header className="flex flex-col md:flex-row justify-between items-center px-4 py-3 md:px-6 md:py-4 border-b border-[var(--border-subtle)] bg-[var(--background-panel)] text-[var(--text-main)]">
      <div className="flex justify-between items-center w-full md:w-auto mb-3 md:mb-0">
        <Link href="/" className="font-bold text-xl tracking-tighter">
          millisecond
        </Link>
        <div className="md:hidden">
          <LanguageSwitcher />
        </div>
      </div>
      
      {step > 0 && (
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
          <span className={step >= 1 ? 'text-[var(--accent-performance)]' : ''}>1. {t('draft')}</span>
          <span>&rarr;</span>
          <span className={step >= 2 ? 'text-[var(--accent-performance)]' : ''}>2. {t('simulate')}</span>
        </div>
      )}

      <div className="hidden md:block">
        <LanguageSwitcher />
      </div>
    </header>
  )
}
