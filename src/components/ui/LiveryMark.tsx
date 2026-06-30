import { resolveHistoricalLivery } from '@/lib/livery'

type LiveryMarkProps = {
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  label?: string
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

const SIZE_CLASS: Record<NonNullable<LiveryMarkProps['size']>, string> = {
  xs: 'h-2.5 w-10',
  sm: 'h-3 w-12',
  md: 'h-3.5 w-14',
}

export default function LiveryMark({
  primaryColor,
  secondaryColor,
  accentColor,
  label,
  size = 'sm',
  className = '',
}: LiveryMarkProps) {
  const palette = resolveHistoricalLivery({
    liveryPrimaryColor: primaryColor,
    liverySecondaryColor: secondaryColor,
    liveryAccentColor: accentColor,
  })

  return (
    <span
      aria-label={label}
      title={label}
      role="img"
      className={`relative inline-flex shrink-0 items-stretch overflow-hidden rounded-[2px] border border-[var(--border-subtle)] bg-[var(--background-panel)] ${SIZE_CLASS[size]} ${className}`}
      data-livery-mark="true"
    >
      <span className="absolute inset-0" style={{ backgroundColor: palette.primaryColor }} />
      <span
        className="absolute inset-y-0 left-[58%] w-[22%]"
        style={{ backgroundColor: palette.secondaryColor ?? palette.primaryColor }}
      />
      <span
        className="absolute inset-y-0 right-0 w-[20%]"
        style={{ backgroundColor: palette.accentColor ?? '#CBD5E1' }}
      />
      <span className="absolute inset-y-[14%] left-[12%] w-[6%] skew-x-[-18deg] bg-white/10" />
      <span className="absolute inset-y-[14%] left-[41%] w-[4%] bg-black/15" />
      <span className="absolute inset-y-[14%] left-[72%] w-[4%] bg-black/20" />
      <span className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <span className="absolute inset-x-0 bottom-0 h-px bg-black/25" />
    </span>
  )
}
