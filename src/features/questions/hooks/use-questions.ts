import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { questionsApi } from '../api/questions-api'
import type {
  CreateLinkedQuestionWithMigrateRequest,
  CreateNewLinkedQuestionRequest,
  CreateQuestionRequest,
  LinkExistingQuestionRequest,
  UpdateBagliKosulRequest,
} from '../types/question.types'

export function useQuestions(baslikId?: number) {
  return useQuery({
    queryKey: queryKeys.questions.all(baslikId),
    queryFn: () => (baslikId ? questionsApi.getByBaslikId(baslikId) : questionsApi.getAll()),
    enabled: baslikId === undefined || baslikId > 0,
  })
}

export function useAnswerInputTypes() {
  return useQuery({
    queryKey: queryKeys.questions.answerInputTypes,
    queryFn: () => questionsApi.getAnswerInputTypes(),
  })
}

export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateQuestionRequest) => questionsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

export function useCreateNewLinkedQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      parentId,
      payload,
    }: {
      parentId: string | number
      payload: CreateNewLinkedQuestionRequest
    }) => questionsApi.createNewLinked(parentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

export function useLinkExistingQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      parentId,
      payload,
    }: {
      parentId: string | number
      payload: LinkExistingQuestionRequest
    }) => questionsApi.linkExisting(parentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

export function useCreateLinkedQuestionWithMigrate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateLinkedQuestionWithMigrateRequest) =>
      questionsApi.migrateAndAddLinked(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Record<string, unknown> }) =>
      questionsApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

export function useSetQuestionActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, aktif }: { id: string | number; aktif: boolean }) =>
      questionsApi.setActive(id, aktif),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

export function useUpdateBagliKosul() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number
      payload: UpdateBagliKosulRequest
    }) => questionsApi.updateBagliKosul(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => questionsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}
