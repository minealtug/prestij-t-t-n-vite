import { apiClient } from '@/lib/api/api-client'
import type { AltSecenekDto } from '../types/alt-secenek.types'
import { mapAltSeceneklerFromApi } from '../utils/normalize-alt-secenek-api'

export const anketAltSecenekApi = {
  getAll: async (): Promise<AltSecenekDto[]> => {
    const raw = await apiClient.get<unknown[]>('/api/AnketAltSecenek')
    return mapAltSeceneklerFromApi(raw)
  },

  getBySecenekGrupId: async (secenekGrupId: number): Promise<AltSecenekDto[]> => {
    const raw = await apiClient.get<unknown[]>('/api/AnketAltSecenek/by-secenek-grup', {
      secenekGrupId,
    })
    return mapAltSeceneklerFromApi(raw)
  },
}
