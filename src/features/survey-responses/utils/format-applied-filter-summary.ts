import type { FilterOptionDto, SurveyResponsesQueryParams } from '../types/survey-response.types'

function findAdi(items: FilterOptionDto[], id?: number): string | undefined {
  if (id == null) return undefined
  return items.find((item) => item.id === id)?.adi
}

export interface FilterOptionLookups {
  menseiler: FilterOptionDto[]
  bolgeler: FilterOptionDto[]
  mintikalar: FilterOptionDto[]
  alimNoktalari: FilterOptionDto[]
  koyler: FilterOptionDto[]
}

export function formatAppliedFilterSummary(
  params: SurveyResponsesQueryParams,
  lookups: FilterOptionLookups,
): string {
  const parts = [
    findAdi(lookups.menseiler, params.menseiId),
    findAdi(lookups.bolgeler, params.bolgeId),
    findAdi(lookups.mintikalar, params.mintikaId),
    findAdi(lookups.alimNoktalari, params.alimNoktasiId),
    findAdi(lookups.koyler, params.koyId),
  ].filter((value): value is string => Boolean(value))

  if (parts.length === 0) return 'Seçili filtreler'
  return parts.join(' · ')
}
