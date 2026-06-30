'use client'

import React from 'react'

interface Column {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
}

interface ResultTableProps {
  columns: Column[]
  data: any[]
}

export default function ResultTable({ columns, data }: ResultTableProps) {
  return (
    <div className="w-full overflow-x-auto border border-[var(--border-subtle)]">
      <table className="w-full text-sm font-mono text-left">
        <thead className="bg-[var(--background-panel)] border-b border-[var(--border-subtle)] uppercase text-[10px] tracking-widest text-[var(--text-muted)]">
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                className={`px-4 py-3 font-normal ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--background-card)]">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-[var(--background-panel)] transition-colors">
              {columns.map(col => (
                <td 
                  key={col.key} 
                  className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
