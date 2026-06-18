import { apiClient } from '@/lib/api/api-client'
import type {
  CevapGirdiTipDto,
  CreateLinkedQuestionWithMigrateRequest,
  CreateNewLinkedQuestionRequest,
  CreateQuestionRequest,
  LinkExistingQuestionRequest,
  LinkedQuestionMigrateResultDto,
  QuestionConnectionDto,
  QuestionDto,
} from '../types/question.types'

export const questionsApi = {
  getAll: () => apiClient.get<QuestionDto[]>('/api/AnketSoru'),
  getByBaslikId: (baslikId: number) =>
    apiClient.get<QuestionDto[]>('/api/AnketSoru', { baslikId }),
  getAnswerInputTypes: () => apiClient.get<CevapGirdiTipDto[]>('/api/AnketCevapGirdiTip'),

  create: (payload: CreateQuestionRequest) =>
    apiClient.post<QuestionDto>('/api/AnketSoru', payload),

  createNewLinked: (parentId: string | number, payload: CreateNewLinkedQuestionRequest) =>
    apiClient.post<QuestionDto>(`/api/AnketSoru/${parentId}/bagli-sorular/yeni`, payload),

  linkExisting: (parentId: string | number, payload: LinkExistingQuestionRequest) =>
    apiClient.post<QuestionConnectionDto>(
      `/api/AnketSoru/${parentId}/bagli-sorular/mevcut`,
      payload,
    ),

  migrateAndAddLinked: (payload: CreateLinkedQuestionWithMigrateRequest) =>
    apiClient.post<LinkedQuestionMigrateResultDto>('/api/AnketSoruBaglanti/migrate-and-add-linked', payload),

  update: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.put<QuestionDto>(`/api/AnketSoru/${id}`, payload),

  setActive: (id: string | number, aktif: boolean) =>
    apiClient.patch<QuestionDto>(`/api/AnketSoru/${id}/aktif?aktif=${aktif}`),

  delete: (id: string | number) => apiClient.delete<void>(`/api/AnketSoru/${id}`),
}
