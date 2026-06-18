import { apiClient } from '@/lib/api/api-client'
import type {
  AnswerUnitDto,
  CreateAnswerUnitRequest,
  UpdateAnswerUnitRequest,
} from '../types/answer-unit.types'
import { mapAnswerUnitFromApi, mapAnswerUnitsFromApi } from '../utils/normalize-answer-unit-api'

export const answerUnitsApi = {
  getAll: async (): Promise<AnswerUnitDto[]> => {
    const raw = await apiClient.get<unknown[]>('/api/AnketCevapBirim')
    return mapAnswerUnitsFromApi(raw)
  },

  getById: async (id: number): Promise<AnswerUnitDto | null> => {
    const raw = await apiClient.get<unknown>(`/api/AnketCevapBirim/${id}`)
    return mapAnswerUnitFromApi(raw)
  },

  create: async (payload: CreateAnswerUnitRequest): Promise<AnswerUnitDto> => {
    const raw = await apiClient.post<unknown>('/api/AnketCevapBirim', payload)
    const mapped = mapAnswerUnitFromApi(raw)
    if (mapped) return mapped
    const items = await answerUnitsApi.getAll()
    const found = items.find(
      (item) => item.adi.toLocaleLowerCase('tr-TR') === payload.adi.trim().toLocaleLowerCase('tr-TR'),
    )
    if (found) return found
    throw new Error('Birim oluşturuldu ancak yanıt okunamadı.')
  },

  update: async (id: number, payload: UpdateAnswerUnitRequest): Promise<AnswerUnitDto> => {
    const raw = await apiClient.put<unknown>(`/api/AnketCevapBirim/${id}`, payload)
    const mapped = mapAnswerUnitFromApi(raw)
    if (mapped) return mapped
    const refetched = await answerUnitsApi.getById(id)
    if (!refetched) throw new Error('Güncellenen birim bulunamadı.')
    return refetched
  },

  delete: (id: number) => apiClient.delete<void>(`/api/AnketCevapBirim/${id}`),
}
