import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { anketAltSecenekApi } from '../api/anket-alt-secenek-api'
import { buildSecenekGrupOptions } from '../utils/build-secenek-grup-options'

export function useSecenekGruplari() {
  const query = useQuery({
    queryKey: queryKeys.questions.altSecenekler,
    queryFn: () => anketAltSecenekApi.getAll(),
  })

  const secenekGruplari = useMemo(
    () => buildSecenekGrupOptions(query.data ?? []),
    [query.data],
  )

  return {
    ...query,
    secenekGruplari,
  }
}
