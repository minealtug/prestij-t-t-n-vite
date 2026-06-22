import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { ekiciDefinitionsApi } from '../api/ekici-definitions-api'
import type {
  CreateEkiciDefinitionRequest,
  UpdateEkiciDefinitionRequest,
} from '../types/ekici-definition.types'

export function useEkiciDefinitions() {
  return useQuery({
    queryKey: queryKeys.ekiciDefinitions.all,
    queryFn: () => ekiciDefinitionsApi.getAll(),
  })
}

export function useCreateEkiciDefinition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateEkiciDefinitionRequest) => ekiciDefinitionsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ekiciDefinitions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.surveyFill.ekiciler })
    },
  })
}

export function useUpdateEkiciDefinition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateEkiciDefinitionRequest
    }) => ekiciDefinitionsApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ekiciDefinitions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.surveyFill.ekiciler })
    },
  })
}

export function useDeleteEkiciDefinition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ekiciDefinitionsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ekiciDefinitions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.surveyFill.ekiciler })
    },
  })
}
