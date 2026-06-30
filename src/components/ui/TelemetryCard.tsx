'use client'

import React from 'react'

interface TelemetryCardProps {
  title: string
  value: string | number
  unit?: string
  accent?: 'speed' | 'performance' | 'budget' | 'warning' | 'telemetry'
}

export default function TelemetryCard({ title, value, unit, accent = 'telemetry' }: TelemetryCardProps) {
  return (
    <div className="bg-[var(--background-card)] border border-[var(--border-subtle)] p-4 relative overflow-hidden group">
      <div 
        className="absolute top-0 left-0 w-1 h-full transition-all duration-300"
        style={{ backgroundColor: `var(--accent-${accent})` }}
      />
      <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2 ml-2">
        {title}
      </div>
      <div className="ml-2 flex items-baseline gap-1">
        <span className="text-2xl font-mono text-[var(--text-main)]">
          {value}
        </span>
        {unit && (
          <span className="text-xs text-[var(--text-muted)] uppercase font-mono">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
