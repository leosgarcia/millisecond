'use client'

import React from 'react'

export default function SectionHeader({ title, subtitle }: { title: string, subtitle?: string }) {
  return (
    <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
      <h2 className="text-lg uppercase tracking-widest font-bold text-[var(--text-main)]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-[var(--text-muted)] mt-1 tracking-wider uppercase font-mono">
          {subtitle}
        </p>
      )}
    </div>
  )
}
