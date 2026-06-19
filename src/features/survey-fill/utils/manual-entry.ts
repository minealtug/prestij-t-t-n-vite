import type { AnketYanitSoruDto } from '../types/anket-yanit.types'
import { getQuestionKey } from './question-key'
import { hasSecenekGrupDropdown } from './resolve-question-input-kind'

export function shouldStartInManualEntry(question: AnketYanitSoruDto, value: string): boolean {
  if (question.cevapAltSecenekId != null && question.cevapAltSecenekId > 0) {
    return false
  }

  if (question.cevapText?.trim()) {
    return true
  }

  const optionId = Number(value)
  if (Number.isFinite(optionId) && optionId > 0) {
    const inList = question.altSecenekler?.some((item) => item.id === optionId)
    return !inList
  }

  return false
}

export function detectInitialManualEntryKeys(
  questions: AnketYanitSoruDto[],
  answers: Record<string, string>,
): Record<string, boolean> {
  const manual: Record<string, boolean> = {}

  for (const question of questions) {
    if (!hasSecenekGrupDropdown(question)) continue

    const key = getQuestionKey(question)
    if (shouldStartInManualEntry(question, answers[key] ?? '')) {
      manual[key] = true
    }
  }

  return manual
}

export function applyManualEntryInitialAnswers(
  questions: AnketYanitSoruDto[],
  answers: Record<string, string>,
  manualEntryByKey: Record<string, boolean>,
): Record<string, string> {
  const next = { ...answers }

  for (const question of questions) {
    const key = getQuestionKey(question)
    if (!manualEntryByKey[key]) continue
    if (question.cevapText?.trim()) {
      next[key] = question.cevapText.trim()
    }
  }

  return next
}
