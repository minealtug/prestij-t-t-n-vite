import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { surveyResponsesApi } from '../api/survey-responses-api'
import type { SurveyResponsesQueryParams } from '../types/survey-response.types'

export function useSurveyResponses(params?: SurveyResponsesQueryParams) {
  return useQuery({
    queryKey: queryKeys.surveyResponses.all(params),
    queryFn: () => surveyResponsesApi.getByEkici(params ?? {}),
    enabled: Boolean(params?.ekiciId),
  })
}
