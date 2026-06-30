'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

interface BudgetMeterProps {
  used: number
  total: number
}

export default function BudgetMeter({ used, total }: BudgetMeterProps) {
  const t = useTranslations('Draft')
  const percentage = (used / total) * 100
  const isOver = used > total
  
  return (
    <div className="bg-[var(--background-panel)] border border-[var(--border-subtle)] p-4 flex flex-col gap-2">
      <div className="flex justify-between items-end uppercase">
        <span className="text-xs tracking-widest text-[var(--text-muted)]">{t('budgetCap')}</span>
        <div className="font-mono flex items-baseline gap-1">
          <span className={`text-xl ${isOver ? 'text-[var(--accent-speed)]' : 'text-[var(--text-main)]'}`}>
            {used}
          </span>
          <span className="text-xs text-[var(--text-muted)]">/ {total} ms</span>
        </div>
      </div>
      
      <div className="h-2 bg-[var(--background-main)] relative overflow-hidden flex">
        <div 
          className={`h-full transition-all duration-300 ${isOver ? 'bg-[var(--accent-speed)]' : 'bg-[var(--accent-budget)]'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {isOver && (
        <div className="text-[10px] uppercase text-[var(--accent-speed)] tracking-wider mt-1 text-right">
          {t('budgetExceeded')}
        </div>
      )}
    </div>
  )
}
