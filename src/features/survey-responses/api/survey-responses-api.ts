import { apiClient } from '@/lib/api/api-client'
import type { AppError } from '@/lib/api/api-error'
import { isDevAuthEnabled } from '@/features/auth/dev/dev-auth'
import { devResponsesStore } from '../dev/dev-responses-store'
import type {
  AnketCevapDto,
  EkiciDto,
  SurveyResponseGroup,
  SurveyResponsesQueryParams,
} from '../types/survey-response.types'
import { filterSurveyResponseGroups, groupAnketCevaplari } from '../utils/map-anket-cevap'

function isNetworkError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isNetworkError' in error &&
    (error as AppError).isNetworkError === true
  )
}

async function withDevFallback<T>(apiCall: () => Promise<T>, devCall: () => T): Promise<T> {
  try {
    return await apiCall()
  } catch (error) {
    if (isDevAuthEnabled() && isNetworkError(error)) {
      return devCall()
    }
    throw error
  }
}

export const surveyResponsesApi = {
  getEkiciler: () =>
    withDevFallback(
      () => apiClient.get<EkiciDto[]>('/api/Ekici'),
      () => devResponsesStore.getEkiciler(),
    ),

  getByEkici: async (params: SurveyResponsesQueryParams): Promise<SurveyResponseGroup[]> => {
    const fetchGroups = async (): Promise<SurveyResponseGroup[]> => {
      if (!params.ekiciId) return []

      const items = await apiClient.get<AnketCevapDto[]>('/api/AnketCevap', {
        ekiciId: params.ekiciId,
      })
      const groups = groupAnketCevaplari(items)
      return filterSurveyResponseGroups(groups, params.search)
    }

    return withDevFallback(fetchGroups, () => devResponsesStore.getByEkici(params))
  },
}
