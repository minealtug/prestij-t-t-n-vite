import { buildSurveyFillDeepLink as buildSurveyFillDeepLinkInternal } from '../utils/survey-fill-navigation'

export interface SurveyFillRecentSave {
  id: string
  baslikId: number
  sablonId: number
  ekiciId: string
  baslikAdi: string
  sablonAdi: string
  ekiciAdi: string
  savedAnswerCount: number
  savedAt: number
}

export function buildRecentSaveId(
  baslikId: number,
  sablonId: number,
  ekiciId: string,
): string {
  return `${baslikId}:${sablonId}:${ekiciId}`
}

export function buildSurveyFillDeepLink(save: Pick<SurveyFillRecentSave, 'baslikId' | 'sablonId' | 'ekiciId'>) {
  return buildSurveyFillDeepLinkInternal({
    baslikId: save.baslikId,
    sablonId: save.sablonId,
    ekiciId: save.ekiciId,
  })
}
