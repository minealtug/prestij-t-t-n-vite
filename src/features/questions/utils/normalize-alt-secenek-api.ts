import type { AltSecenekDto } from '../types/alt-secenek.types'

function pick<T>(obj: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    const value = obj[key]
    if (value !== undefined && value !== null) return value as T
  }
  return undefined
}

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
}

export function mapAltSecenekFromApi(raw: unknown): AltSecenekDto | null {
  const row = asRecord(raw)
  const id = Number(pick(row, 'id', 'Id'))
  const secenekGrupId = Number(pick(row, 'secenekGrupId', 'SecenekGrupId'))
  if (!Number.isFinite(id) || id <= 0) return null
  if (!Number.isFinite(secenekGrupId) || secenekGrupId <= 0) return null

  const adi = String(pick(row, 'adi', 'Adi') ?? '').trim()
  if (!adi) return null

  const siraNo = Number(pick(row, 'siraNo', 'SiraNo') ?? 0)

  return {
    id,
    secenekGrupId,
    adi,
    siraNo: Number.isFinite(siraNo) ? siraNo : 0,
  }
}

export function mapAltSeceneklerFromApi(raw: unknown): AltSecenekDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(mapAltSecenekFromApi)
    .filter((item): item is AltSecenekDto => item !== null)
}
