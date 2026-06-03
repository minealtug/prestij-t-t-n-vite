import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { surveyResponsesApi } from '../api/survey-responses-api'

export function useEkiciler() {
  return useQuery({
    queryKey: queryKeys.surveyResponses.ekiciler,
    queryFn: () => surveyResponsesApi.getEkiciler(),
  })
}
