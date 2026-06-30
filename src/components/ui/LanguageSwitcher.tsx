'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '../../i18n/routing'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => switchLanguage('pt-BR')} 
        style={{ fontWeight: locale === 'pt-BR' ? 'bold' : 'normal', cursor: 'pointer', background: 'transparent', border: 'none', color: 'inherit' }}
      >
        PT
      </button>
      <span>|</span>
      <button 
        onClick={() => switchLanguage('en')} 
        style={{ fontWeight: locale === 'en' ? 'bold' : 'normal', cursor: 'pointer', background: 'transparent', border: 'none', color: 'inherit' }}
      >
        EN
      </button>
    </div>
  )
}
