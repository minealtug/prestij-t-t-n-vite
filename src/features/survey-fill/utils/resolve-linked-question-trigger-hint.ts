import type { AnketYanitSoruDto } from '../types/anket-yanit.types'
import type { AnswerTypeKindLookup } from './build-answer-type-kind-lookup'
import { isBuyukEsitKosul } from '@/features/questions/utils/bagli-kosul-tipi'
import {
  isMultiSelectSecenekQuestion,
  resolveBaseAnswerInputKind,
} from './resolve-question-input-kind'

export function resolveLinkedQuestionTriggerHint(
  question: AnketYanitSoruDto,
  allQuestions: AnketYanitSoruDto[],
  answerTypeLookup?: AnswerTypeKindLookup,
): string | null {
  if (!question.bagliSoru) return null

  const triggerId = question.bagliAltSecenekId
  if (triggerId == null || triggerId <= 0) return null

  const parentId = question.bagliOlduguSoruId
  if (parentId == null || parentId <= 0) return null

  const parent = allQuestions.find((item) => item.soruId === parentId)
  if (!parent) return null

  const triggerOption = (parent.altSecenekler ?? []).find((option) => option.id === triggerId)
  const optionLabel = triggerOption?.adi?.trim() || `Seçenek #${triggerId}`
  const buyukEsit = isBuyukEsitKosul(question.bagliKosulTipi)
  const parentIsMultiSelect = isMultiSelectSecenekQuestion(parent, answerTypeLookup)
  const parentKind = resolveBaseAnswerInputKind(parent, answerTypeLookup)

  if (parentIsMultiSelect) {
    if (buyukEsit) {
      return `Bu soru, üst soruda "${optionLabel}" veya üzeri seçenek işaretlendiğinde görünür.`
    }
    return `Bu soru, üst soruda "${optionLabel}" seçeneği işaretlendiğinde görünür.`
  }

  if (parentKind === 'checkbox') {
    return 'Bu soru, üst soruda "Evet" işaretlendiğinde görünür.'
  }

  if (buyukEsit) {
    return `Bu soru, üst soruda "${optionLabel}" veya üzeri seçildiğinde görünür.`
  }

  return `Bu soru, üst soruda "${optionLabel}" seçildiğinde görünür.`
}
