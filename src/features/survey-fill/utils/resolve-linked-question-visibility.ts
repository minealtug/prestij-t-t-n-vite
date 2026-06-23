import type { AnketYanitSoruDto } from '../types/anket-yanit.types'
import type { AnswerTypeKindLookup } from './build-answer-type-kind-lookup'
import { isBagliKosulMatchedForAny } from './evaluate-bagli-kosul'
import { getQuestionKey } from './question-key'
import { parseMultiSelectValue } from './multi-select-value'
import { resolveEffectiveQuestionInputKind } from './resolve-question-input-kind'
import { sortQuestionsUnderParents } from './sort-survey-fill-questions'

function isFormValueAnswered(
  question: AnketYanitSoruDto,
  value: string,
  answerTypeLookup?: AnswerTypeKindLookup,
  useManualEntry = false,
): boolean {
  const kind = resolveEffectiveQuestionInputKind(question, answerTypeLookup, useManualEntry)

  if (kind === 'checkbox') return value === 'true'
  if (kind === 'multiSelect') return parseMultiSelectValue(value).length > 0
  if (kind === 'select') {
    const optionId = Number(value)
    return Number.isFinite(optionId) && optionId > 0
  }
  if (kind === 'ekici') return value.trim().length > 0

  return value.trim().length > 0
}

function readFormCevapAltSecenekIds(
  question: AnketYanitSoruDto,
  value: string,
  answerTypeLookup?: AnswerTypeKindLookup,
  useManualEntry = false,
): number[] {
  const kind = resolveEffectiveQuestionInputKind(question, answerTypeLookup, useManualEntry)

  if (kind === 'multiSelect') {
    return parseMultiSelectValue(value)
  }

  if (kind !== 'select' || useManualEntry) return []

  const optionId = Number(value)
  return Number.isFinite(optionId) && optionId > 0 ? [optionId] : []
}

function readParentCevapAltSecenekIds(
  parent: AnketYanitSoruDto,
  answers: Record<string, string>,
  answerTypeLookup?: AnswerTypeKindLookup,
  manualEntryByKey: Record<string, boolean> = {},
): number[] | undefined {
  const parentKey = getQuestionKey(parent)
  const parentValue = answers[parentKey] ?? ''
  const parentManual = manualEntryByKey[parentKey] ?? false

  if (isFormValueAnswered(parent, parentValue, answerTypeLookup, parentManual)) {
    return readFormCevapAltSecenekIds(parent, parentValue, answerTypeLookup, parentManual)
  }

  if (!parent.yanitlandi) return undefined

  if ((parent.cevapAltSecenekIds?.length ?? 0) > 0) {
    return parent.cevapAltSecenekIds!
  }

  if (parent.cevapAltSecenekId != null && parent.cevapAltSecenekId > 0) {
    return [parent.cevapAltSecenekId]
  }

  return []
}

function isParentAnswered(
  parent: AnketYanitSoruDto,
  answers: Record<string, string>,
  answerTypeLookup?: AnswerTypeKindLookup,
  manualEntryByKey: Record<string, boolean> = {},
): boolean {
  const parentKey = getQuestionKey(parent)
  const parentValue = answers[parentKey] ?? ''
  const parentManual = manualEntryByKey[parentKey] ?? false

  if (isFormValueAnswered(parent, parentValue, answerTypeLookup, parentManual)) {
    return true
  }

  if (!parent.yanitlandi) return false

  return (
    (parent.cevapAltSecenekIds?.length ?? 0) > 0 ||
    parent.cevapAltSecenekId != null ||
    Boolean(parent.cevapText?.trim()) ||
    Boolean(parent.ekiciId?.trim())
  )
}

export function isLinkedQuestionVisible(
  question: AnketYanitSoruDto,
  allQuestions: AnketYanitSoruDto[],
  answers: Record<string, string>,
  answerTypeLookup?: AnswerTypeKindLookup,
  manualEntryByKey: Record<string, boolean> = {},
  questionsById = new Map(allQuestions.map((item) => [item.soruId, item])),
): boolean {
  if (!question.bagliSoru) return true

  const parentId = question.bagliOlduguSoruId
  if (parentId == null || parentId <= 0) return false

  const parent = questionsById.get(parentId)
  if (!parent) return false

  if (parent.bagliSoru && !isLinkedQuestionVisible(
    parent,
    allQuestions,
    answers,
    answerTypeLookup,
    manualEntryByKey,
    questionsById,
  )) {
    return false
  }

  if (!isParentAnswered(parent, answers, answerTypeLookup, manualEntryByKey)) {
    return false
  }

  if (question.bagliAltSecenekId == null || question.bagliAltSecenekId <= 0) {
    return true
  }

  const parentAltSecenekIds = readParentCevapAltSecenekIds(
    parent,
    answers,
    answerTypeLookup,
    manualEntryByKey,
  )

  if (parentAltSecenekIds === undefined) return false

  return isBagliKosulMatchedForAny(
    parentAltSecenekIds,
    question.bagliAltSecenekId,
    question.bagliKosulTipi,
    parent.altSecenekler ?? [],
  )
}

export function filterVisibleQuestionsForFill(
  questions: AnketYanitSoruDto[],
  answers: Record<string, string>,
  answerTypeLookup?: AnswerTypeKindLookup,
  manualEntryByKey: Record<string, boolean> = {},
): AnketYanitSoruDto[] {
  const questionsById = new Map(questions.map((item) => [item.soruId, item]))

  const visible = questions.filter((question) =>
    isLinkedQuestionVisible(
      question,
      questions,
      answers,
      answerTypeLookup,
      manualEntryByKey,
      questionsById,
    ),
  )

  return sortQuestionsUnderParents(visible)
}
