import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { cografiFiltreApi } from '../api/cografi-filtre-api'

const COGRAFI_FILTRE_STALE_MS = 30 * 60 * 1000

export function useCografiFiltreOptions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.cografiFiltre.options,
    queryFn: () => cografiFiltreApi.getOptions(),
    staleTime: COGRAFI_FILTRE_STALE_MS,
    enabled,
  })
}

export function useMintikaCografiFiltreOptions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.cografiFiltre.mintikaOptions,
    queryFn: () => cografiFiltreApi.getMintikaScopedOptions(),
    staleTime: COGRAFI_FILTRE_STALE_MS,
    enabled,
  })
}
