'use client'

import React from 'react'

interface TimingBarProps {
  label: string
  value: number
  max?: number
  accent?: 'speed' | 'performance' | 'telemetry'
}

export default function TimingBar({ label, value, max = 100, accent = 'telemetry' }: TimingBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs uppercase tracking-wider mb-1 font-mono">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="text-[var(--text-main)]">{value.toFixed(1)}</span>
      </div>
      <div className="h-1 bg-[var(--background-main)] border border-[var(--border-subtle)] overflow-hidden">
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: `var(--accent-${accent})`
          }}
        />
      </div>
    </div>
  )
}
