import { apiClient } from '@/lib/api/api-client'
import type { CografiFiltreOptionsDto } from '../types'
import { mapCografiFiltreOptionsFromApi } from '../utils/cografi-filtre'

export const cografiFiltreApi = {
  getOptions: async (): Promise<CografiFiltreOptionsDto> => {
    const raw = await apiClient.get<unknown>('/api/CografiFiltre/options')
    return mapCografiFiltreOptionsFromApi(raw)
  },

  getMintikaScopedOptions: async (): Promise<CografiFiltreOptionsDto> => {
    const raw = await apiClient.get<unknown>('/api/CografiFiltre/mintikam/options')
    return mapCografiFiltreOptionsFromApi(raw)
  },
}
