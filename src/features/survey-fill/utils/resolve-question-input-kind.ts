import type { SurveyFillSoruView } from '../types/anket-yanit.types'
import type { AnswerTypeKindLookup } from './build-answer-type-kind-lookup'
import { isEkiciProducerQuestion } from './is-ekici-producer-question'
import { resolveAnswerInputKind, type AnswerInputKind } from './resolve-answer-input-kind'

export type QuestionInputKind = AnswerInputKind | 'ekici'

export function resolveQuestionInputKind(
  question: SurveyFillSoruView,
  answerTypeLookup?: AnswerTypeKindLookup,
): QuestionInputKind {
  if (isEkiciProducerQuestion(question)) return 'ekici'

  if (hasSecenekGrupDropdown(question)) {
    return 'select'
  }

  return resolveBaseAnswerInputKind(question, answerTypeLookup)
}

export function hasSecenekGrupDropdown(question: SurveyFillSoruView): boolean {
  if (isEkiciProducerQuestion(question)) return false
  return question.secenekGrupId != null && question.secenekGrupId > 0
}

export function resolveBaseAnswerInputKind(
  question: SurveyFillSoruView,
  answerTypeLookup?: AnswerTypeKindLookup,
): QuestionInputKind {
  if (isEkiciProducerQuestion(question)) return 'ekici'

  const tipId = question.cevapGirdiTipId
  if (tipId != null && answerTypeLookup?.has(tipId)) {
    return answerTypeLookup.get(tipId)!
  }

  if (question.cevapGirdiTipAdi?.trim()) {
    return resolveAnswerInputKind(question.cevapGirdiTipAdi)
  }

  return 'text'
}

export function resolveEffectiveQuestionInputKind(
  question: SurveyFillSoruView,
  answerTypeLookup: AnswerTypeKindLookup | undefined,
  useManualEntry: boolean,
): QuestionInputKind {
  if (useManualEntry && hasSecenekGrupDropdown(question)) {
    return resolveBaseAnswerInputKind(question, answerTypeLookup)
  }

  return resolveQuestionInputKind(question, answerTypeLookup)
}
