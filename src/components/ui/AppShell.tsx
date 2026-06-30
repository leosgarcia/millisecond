'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('common')

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow w-full max-w-[1200px] mx-auto p-4 md:p-8">
        {children}
      </main>
      <footer className="w-full border-t border-[var(--border-subtle)] p-4 text-center text-xs text-[var(--text-muted)] uppercase tracking-wider">
        {t('footer')}
      </footer>
    </div>
  )
}
