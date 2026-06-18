import type { AnswerUnitDto } from '../types/answer-unit.types'

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

export function mapAnswerUnitFromApi(raw: unknown): AnswerUnitDto | null {
  const row = asRecord(raw)
  const id = Number(pick(row, 'id', 'Id'))
  if (!Number.isFinite(id) || id <= 0) return null

  const adi = String(pick(row, 'adi', 'Adi', 'name', 'Name') ?? '').trim()
  if (!adi) return null

  return {
    id,
    adi,
  }
}

export function mapAnswerUnitsFromApi(raw: unknown): AnswerUnitDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(mapAnswerUnitFromApi)
    .filter((item): item is AnswerUnitDto => item !== null)
    .sort((a, b) => a.adi.localeCompare(b.adi, 'tr-TR'))
}
