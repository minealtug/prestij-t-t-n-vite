import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { anketAltSecenekApi } from '@/features/questions/api/anket-alt-secenek-api'
import { queryKeys } from '@/lib/query/query-keys'
import type { AltSecenekOptionDto } from '../types/anket-yanit.types'

export function useAltSeceneklerByGrupIds(secenekGrupIds: number[]) {
  const uniqueIds = useMemo(
    () => [...new Set(secenekGrupIds.filter((id) => Number.isFinite(id) && id > 0))],
    [secenekGrupIds],
  )

  const queries = useQueries({
    queries: uniqueIds.map((secenekGrupId) => ({
      queryKey: queryKeys.surveyFill.altSecenekler(secenekGrupId),
      queryFn: async (): Promise<AltSecenekOptionDto[]> => {
        const items = await anketAltSecenekApi.getBySecenekGrupId(secenekGrupId)
        return items
          .sort((left, right) => {
            if (left.siraNo !== right.siraNo) return left.siraNo - right.siraNo
            return left.adi.localeCompare(right.adi, 'tr-TR')
          })
          .map((item) => ({ id: item.id, adi: item.adi }))
      },
      staleTime: 30 * 60 * 1000,
    })),
  })

  const optionsByGrupId = useMemo(() => {
    const map: Record<number, AltSecenekOptionDto[]> = {}
    uniqueIds.forEach((secenekGrupId, index) => {
      map[secenekGrupId] = queries[index]?.data ?? []
    })
    return map
  }, [queries, uniqueIds])

  return {
    optionsByGrupId,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
  }
}
