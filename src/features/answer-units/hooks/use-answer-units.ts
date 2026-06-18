import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { answerUnitsApi } from '../api/answer-units-api'
import type { CreateAnswerUnitRequest, UpdateAnswerUnitRequest } from '../types/answer-unit.types'

export function useAnswerUnits() {
  return useQuery({
    queryKey: queryKeys.answerUnits.all,
    queryFn: () => answerUnitsApi.getAll(),
  })
}

export function useCreateAnswerUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAnswerUnitRequest) => answerUnitsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.answerUnits.all })
    },
  })
}

export function useUpdateAnswerUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAnswerUnitRequest }) =>
      answerUnitsApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.answerUnits.all })
    },
  })
}

export function useDeleteAnswerUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => answerUnitsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.answerUnits.all })
    },
  })
}
