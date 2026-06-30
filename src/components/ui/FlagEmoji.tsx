import { formatCountryName, resolveCountryCode } from '@/lib/country'

type FlagVariant =
  | { kind: 'h'; colors: [string, string, string] }
  | { kind: 'v'; colors: [string, string, string] }
  | { kind: 'jp' }
  | { kind: 'fi' }
  | { kind: 'ch' }
  | { kind: 'us' }
  | { kind: 'br' }
  | { kind: 'gb' }
  | { kind: 'solid'; color: string }

function getFlagVariant(code?: string | null): FlagVariant | null {
  const normalized = resolveCountryCode(code)
  switch (normalized) {
    case 'DE':
      return { kind: 'h', colors: ['#000000', '#DD0000', '#FFCE00'] }
    case 'IT':
      return { kind: 'v', colors: ['#009246', '#F4F5F0', '#CE2B37'] }
    case 'FR':
      return { kind: 'v', colors: ['#0055A4', '#F4F5F0', '#EF4135'] }
    case 'NL':
      return { kind: 'h', colors: ['#AE1C28', '#F4F5F0', '#21468B'] }
    case 'AT':
      return { kind: 'h', colors: ['#ED2939', '#F4F5F0', '#ED2939'] }
    case 'BE':
      return { kind: 'v', colors: ['#000000', '#FDDA24', '#EF3340'] }
    case 'MX':
      return { kind: 'v', colors: ['#006847', '#F4F5F0', '#CE1126'] }
    case 'ES':
      return { kind: 'h', colors: ['#AA151B', '#F1BF00', '#AA151B'] }
    case 'SE':
      return { kind: 'solid', color: '#005293' }
    case 'FI':
      return { kind: 'fi' }
    case 'CH':
      return { kind: 'ch' }
    case 'JP':
      return { kind: 'jp' }
    case 'US':
      return { kind: 'us' }
    case 'BR':
      return { kind: 'br' }
    case 'GB':
      return { kind: 'gb' }
    case 'CA':
      return { kind: 'v', colors: ['#D80621', '#F4F5F0', '#D80621'] }
    case 'AU':
      return { kind: 'solid', color: '#012169' }
    case 'AR':
      return { kind: 'h', colors: ['#74ACDF', '#F4F5F0', '#74ACDF'] }
    default:
      return null
  }
}

export default function FlagEmoji({
  code,
  locale = 'pt-BR',
  className = '',
  showFallbackName = false,
}: {
  code?: string | null
  locale?: string
  className?: string
  showFallbackName?: boolean
}) {
  const label = formatCountryName(code, locale)
  const variant = getFlagVariant(code)
  const isFallback = !variant

  if (isFallback) {
    return (
      <span
        aria-label={label}
        title={label}
        role="img"
        className={`flag-emoji inline-flex min-w-[1.65em] items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--background-main)] px-2 py-0.5 text-[0.95em] leading-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] select-none not-italic normal-case tracking-normal ${className}`}
        data-fallback="true"
      >
        <span className="translate-y-[0.02em]">{showFallbackName ? label : '🌐'}</span>
      </span>
    )
  }

  const flagBase = 'flag-emoji relative inline-flex h-[1.05em] w-[1.6em] shrink-0 items-stretch overflow-hidden rounded-[4px] border border-[rgba(255,255,255,0.18)] bg-[var(--background-main)] shadow-[0_0_0_1px_rgba(0,0,0,0.22)]'

  return (
    <span
      aria-label={label}
      title={label}
      role="img"
      className={`${flagBase} ${className}`}
      data-fallback="false"
    >
      {variant.kind === 'h' && (
        <>
          <span className="absolute inset-x-0 top-0 h-1/3" style={{ backgroundColor: variant.colors[0] }} />
          <span className="absolute inset-x-0 top-1/3 h-1/3" style={{ backgroundColor: variant.colors[1] }} />
          <span className="absolute inset-x-0 bottom-0 h-1/3" style={{ backgroundColor: variant.colors[2] }} />
        </>
      )}
      {variant.kind === 'v' && (
        <>
          <span className="absolute inset-y-0 left-0 w-1/3" style={{ backgroundColor: variant.colors[0] }} />
          <span className="absolute inset-y-0 left-1/3 w-1/3" style={{ backgroundColor: variant.colors[1] }} />
          <span className="absolute inset-y-0 right-0 w-1/3" style={{ backgroundColor: variant.colors[2] }} />
        </>
      )}
      {variant.kind === 'solid' && <span className="absolute inset-0" style={{ backgroundColor: variant.color }} />}
      {variant.kind === 'jp' && (
        <>
          <span className="absolute inset-0 bg-white" />
          <span className="absolute left-1/2 top-1/2 h-[0.52em] w-[0.52em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#BC002D]" />
        </>
      )}
      {variant.kind === 'fi' && (
        <>
          <span className="absolute inset-0 bg-white" />
          <span className="absolute left-[0.35em] top-0 h-full w-[0.16em] bg-[#003580]" />
          <span className="absolute left-0 top-[0.42em] h-[0.16em] w-full bg-[#003580]" />
        </>
      )}
      {variant.kind === 'ch' && (
        <>
          <span className="absolute inset-0 bg-[#D52B1E]" />
          <span className="absolute left-1/2 top-1/2 h-[0.44em] w-[0.16em] -translate-x-1/2 -translate-y-1/2 bg-white" />
          <span className="absolute left-1/2 top-1/2 h-[0.16em] w-[0.44em] -translate-x-1/2 -translate-y-1/2 bg-white" />
        </>
      )}
      {variant.kind === 'us' && (
        <>
          <span className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,#B22234_0,#B22234_0.12em,#FFFFFF_0.12em,#FFFFFF_0.24em)]" />
          <span className="absolute left-0 top-0 h-[0.56em] w-[0.7em] bg-[#3C3B6E]" />
        </>
      )}
      {variant.kind === 'br' && (
        <>
          <span className="absolute inset-0 bg-[#009C3B]" />
          <span className="absolute left-1/2 top-1/2 h-[0.82em] w-[0.82em] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#FFDF00]" />
          <span className="absolute left-1/2 top-1/2 h-[0.42em] w-[0.42em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#002776]" />
        </>
      )}
      {variant.kind === 'gb' && (
        <>
          <span className="absolute inset-0 bg-[#012169]" />
          <span className="absolute left-1/2 top-0 h-full w-[0.22em] -translate-x-1/2 bg-white/90" />
          <span className="absolute left-0 top-1/2 h-[0.22em] w-full -translate-y-1/2 bg-white/90" />
          <span className="absolute left-1/2 top-0 h-full w-[0.1em] -translate-x-1/2 bg-[#C8102E]" />
          <span className="absolute left-0 top-1/2 h-[0.1em] w-full -translate-y-1/2 bg-[#C8102E]" />
          <span className="absolute inset-0 bg-[linear-gradient(135deg,transparent_41%,white_41%,white_46%,transparent_46%,transparent_54%,white_54%,white_59%,transparent_59%)] opacity-90" />
          <span className="absolute inset-0 bg-[linear-gradient(45deg,transparent_41%,white_41%,white_46%,transparent_46%,transparent_54%,white_54%,white_59%,transparent_59%)] opacity-90" />
          <span className="absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,#C8102E_45%,#C8102E_49%,transparent_49%,transparent_51%,#C8102E_51%,#C8102E_55%,transparent_55%)]" />
          <span className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,#C8102E_45%,#C8102E_49%,transparent_49%,transparent_51%,#C8102E_51%,#C8102E_55%,transparent_55%)]" />
        </>
      )}
    </span>
  )
}
