import type { AnswerUnitDto } from '../types/answer-unit.types'

export const DUPLICATE_ANSWER_UNIT_NAME_MESSAGE = 'Bu birim adı zaten tanımlı.'

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase('tr-TR')
}

export function isAnswerUnitNameTaken(
  name: string,
  units: AnswerUnitDto[],
  excludeId?: number,
): boolean {
  const normalized = normalizeName(name)
  if (!normalized) return false

  return units.some(
    (unit) =>
      unit.id !== excludeId && normalizeName(unit.adi) === normalized,
  )
}
