import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { anketAltSecenekApi } from '../api/anket-alt-secenek-api'
import { buildAltSecenekOptions } from '../utils/build-alt-secenek-options'

export function useAltSeceneklerByGrupId(secenekGrupId?: number) {
  const enabled = Number.isFinite(secenekGrupId) && (secenekGrupId ?? 0) > 0

  const query = useQuery({
    queryKey: queryKeys.questions.altSeceneklerByGrup(secenekGrupId ?? 0),
    queryFn: () => anketAltSecenekApi.getBySecenekGrupId(secenekGrupId!),
    enabled,
    staleTime: 30 * 60 * 1000,
  })

  const options = buildAltSecenekOptions(query.data ?? [], secenekGrupId, query.isLoading)

  return {
    ...query,
    options,
  }
}
