import type { AltSecenekOptionDto } from '../types/anket-yanit.types'

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

export function mapAltSecenekFromApi(raw: unknown): AltSecenekOptionDto | null {
  const row = asRecord(raw)
  const id = Number(pick(row, 'id', 'Id'))
  if (!Number.isFinite(id) || id <= 0) return null

  const adi = String(pick(row, 'adi', 'Adi') ?? '').trim()
  if (!adi) return null

  const siraNoRaw = Number(pick(row, 'siraNo', 'SiraNo'))
  const siraNo = Number.isFinite(siraNoRaw) && siraNoRaw > 0 ? siraNoRaw : null

  return { id, adi, siraNo }
}

export function mapAltSeceneklerFromApi(raw: unknown): AltSecenekOptionDto[] {
  if (!Array.isArray(raw)) return []
  return mapAltSeceneklerListFromApi(raw)
}

export function mapAltSeceneklerListFromApi(raw: unknown[]): AltSecenekOptionDto[] {
  const seen = new Set<number>()
  const options: Array<AltSecenekOptionDto & { siraNo: number }> = []

  for (const item of raw) {
    const mapped = mapAltSecenekFromApi(item)
    if (!mapped || seen.has(mapped.id)) continue
    seen.add(mapped.id)
    const row = asRecord(item)
    const siraNo = Number(pick(row, 'siraNo', 'SiraNo') ?? 0)
    options.push({
      ...mapped,
      siraNo: Number.isFinite(siraNo) ? siraNo : 0,
    })
  }

  return options
    .sort((a, b) => {
      if (a.siraNo !== b.siraNo) return a.siraNo - b.siraNo
      return a.adi.localeCompare(b.adi, 'tr-TR')
    })
    .map(({ id, adi, siraNo }) => ({ id, adi, siraNo: siraNo > 0 ? siraNo : null }))
}
