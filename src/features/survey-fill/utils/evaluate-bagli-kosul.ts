import type { AltSecenekOptionDto } from '@/features/survey-fill/types/anket-yanit.types'
import {
  isBuyukEsitKosul,
  normalizeBagliKosulTipi,
  type BagliKosulTipi,
} from '@/features/questions/utils/bagli-kosul-tipi'

function resolveOptionRank(option: AltSecenekOptionDto, positionFallback: number): number {
  if (option.siraNo != null && option.siraNo > 0) return option.siraNo

  const parsed = Number(option.adi.trim())
  if (Number.isFinite(parsed) && parsed > 0) return parsed

  return positionFallback
}

export function buildOptionRankById(options: AltSecenekOptionDto[]): Map<number, number> {
  const ranks = new Map<number, number>()

  options.forEach((option, index) => {
    ranks.set(option.id, resolveOptionRank(option, index + 1))
  })

  return ranks
}

export function isBagliKosulMatched(
  parentCevapAltSecenekId: number | null | undefined,
  bagliAltSecenekId: number | null | undefined,
  bagliKosulTipi: unknown,
  parentOptions: AltSecenekOptionDto[] = [],
): boolean {
  if (bagliAltSecenekId == null || bagliAltSecenekId <= 0) return true
  if (parentCevapAltSecenekId == null || parentCevapAltSecenekId <= 0) return false

  return isBagliKosulMatchedForId(
    parentCevapAltSecenekId,
    bagliAltSecenekId,
    bagliKosulTipi,
    parentOptions,
  )
}

export function isBagliKosulMatchedForAny(
  parentCevapAltSecenekIds: number[] | null | undefined,
  bagliAltSecenekId: number | null | undefined,
  bagliKosulTipi: unknown,
  parentOptions: AltSecenekOptionDto[] = [],
): boolean {
  if (bagliAltSecenekId == null || bagliAltSecenekId <= 0) return true

  const ids = parentCevapAltSecenekIds?.filter((id) => id > 0) ?? []
  if (ids.length === 0) return false

  return ids.some((parentId) =>
    isBagliKosulMatchedForId(parentId, bagliAltSecenekId, bagliKosulTipi, parentOptions),
  )
}

function isBagliKosulMatchedForId(
  parentCevapAltSecenekId: number,
  bagliAltSecenekId: number,
  bagliKosulTipi: unknown,
  parentOptions: AltSecenekOptionDto[],
): boolean {
  const kosul = normalizeBagliKosulTipi(bagliKosulTipi)
  if (!isBuyukEsitKosul(kosul)) {
    return parentCevapAltSecenekId === bagliAltSecenekId
  }

  const ranks = buildOptionRankById(parentOptions)
  const parentRank = ranks.get(parentCevapAltSecenekId)
  const thresholdRank = ranks.get(bagliAltSecenekId)

  if (parentRank == null || thresholdRank == null) {
    return parentCevapAltSecenekId === bagliAltSecenekId
  }

  return parentRank >= thresholdRank
}

export type { BagliKosulTipi }
