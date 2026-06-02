export interface SurveyDto {
  id: string
  name: string
  aciklama?: string | null
  kaynak?: 'AppDb' | 'LegacyDb' | string
}

export interface CreateSurveyRequest {
  name: string
  category?: string
}
