import type { AnketYanitSoruDto } from '../types/anket-yanit.types'
import type { AnswerTypeKindLookup } from './build-answer-type-kind-lookup'
import { isBagliKosulMatched } from './evaluate-bagli-kosul'
import { getQuestionKey } from './question-key'
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
  if (kind === 'select') {
    const optionId = Number(value)
    return Number.isFinite(optionId) && optionId > 0
  }
  if (kind === 'ekici') return value.trim().length > 0

  return value.trim().length > 0
}

function readFormCevapAltSecenekId(
  question: AnketYanitSoruDto,
  value: string,
  answerTypeLookup?: AnswerTypeKindLookup,
  useManualEntry = false,
): number | null {
  const kind = resolveEffectiveQuestionInputKind(question, answerTypeLookup, useManualEntry)
  if (kind !== 'select' || useManualEntry) return null

  const optionId = Number(value)
  return Number.isFinite(optionId) && optionId > 0 ? optionId : null
}

function readParentCevapAltSecenekId(
  parent: AnketYanitSoruDto,
  answers: Record<string, string>,
  answerTypeLookup?: AnswerTypeKindLookup,
  manualEntryByKey: Record<string, boolean> = {},
): number | null | undefined {
  const parentKey = getQuestionKey(parent)
  const parentValue = answers[parentKey] ?? ''
  const parentManual = manualEntryByKey[parentKey] ?? false

  if (isFormValueAnswered(parent, parentValue, answerTypeLookup, parentManual)) {
    return readFormCevapAltSecenekId(parent, parentValue, answerTypeLookup, parentManual)
  }

  if (parent.yanitlandi && parent.cevapAltSecenekId != null && parent.cevapAltSecenekId > 0) {
    return parent.cevapAltSecenekId
  }

  return undefined
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

  const parentAltSecenekId = readParentCevapAltSecenekId(
    parent,
    answers,
    answerTypeLookup,
    manualEntryByKey,
  )

  if (parentAltSecenekId === undefined) return false

  return isBagliKosulMatched(
    parentAltSecenekId,
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
