import type { EkiciDefinitionDto } from '../types/ekici-definition.types'
import { getEkiciFullName } from './normalize-ekici-definition-api'

const TR_LOCALE = 'tr-TR'

export function formatTurkishTitleCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return word
      const lower = word.toLocaleLowerCase(TR_LOCALE)
      return lower.charAt(0).toLocaleUpperCase(TR_LOCALE) + lower.slice(1)
    })
    .join(' ')
}

export function formatEkiciDisplayText(value: string | null | undefined): string {
  if (!value?.trim()) return ''
  return formatTurkishTitleCase(value)
}

export function getEkiciFullNameDisplay(
  ekici: Pick<EkiciDefinitionDto, 'ad' | 'soyad'>,
): string {
  const fullName = getEkiciFullName(ekici)
  return fullName === '—' ? fullName : formatTurkishTitleCase(fullName)
}
