'use client'

import React from 'react'

export default function TechnicalBadge({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="inline-flex items-center border border-[var(--border-subtle)] bg-[var(--background-main)] text-[10px] uppercase font-mono tracking-wider">
      <span className="px-2 py-1 text-[var(--text-muted)] border-r border-[var(--border-subtle)]">
        {label}
      </span>
      <span className="px-2 py-1 text-[var(--accent-performance)]">
        {value}
      </span>
    </div>
  )
}
