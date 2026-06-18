export type AnswerType =
  | 'long_text'
  | 'short_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'number'
  | 'date'

export interface QuestionDto {
  id: string | number
  baslikId: number
  baslikAdi: string
  cevapGirdiTipAdi?: string
  cevapGirdiTipId?: number
  soruMetni: string
  altSoruMetni: string | null
  zorunlu: boolean
  aktif: boolean
  secenekGrupId: number | null
  bagliSoru: boolean
  bagliOlduguSoruId?: number | null
  bagliOlduguSoru?: string | { soruMetni?: string | null; [key: string]: unknown } | null
  kaynak?: 'AppDb' | 'LegacyDb' | string
}

export interface CevapGirdiTipDto {
  id: number
  adi: string
  siraNo: number
  kaynak?: string | null
}

export interface CreateLinkedQuestionPayload {
  cevapGirdiTipId: number
  soruMetni: string
  altSoruMetni?: string
  zorunlu: boolean
  aktif: boolean
  secenekGrupId?: number
  anketCevapBirimId?: number
  bagliAltSecenekId?: number
  bagliSorular?: CreateLinkedQuestionPayload[]
}

export interface CreateQuestionRequest {
  baslikId: number
  cevapGirdiTipId: number
  soruMetni: string
  altSoruMetni?: string
  zorunlu: boolean
  aktif: boolean
  secenekGrupId?: number
  anketCevapBirimId?: number
  bagliSoru: boolean
  bagliSorular?: CreateLinkedQuestionPayload[]
}

export interface CreateNewLinkedQuestionRequest {
  baslikId: number
  cevapGirdiTipId: number
  soruMetni: string
  altSoruMetni?: string
  zorunlu: boolean
  aktif: boolean
  secenekGrupId?: number
  anketCevapBirimId?: number
  bagliAltSecenekId?: number
}

export interface LinkExistingQuestionRequest {
  bagliSoruId: number
  bagliAltSecenekId?: number | null
}

export interface QuestionConnectionDto {
  id: number
  soruId: number
  bagliSoruId: number
  bagliAltSecenekId?: number | null
}

export interface CreateLinkedQuestionWithMigrateRequest extends CreateNewLinkedQuestionRequest {
  parentLegacyQuestionId: number
  bagliLegacyAltSecenekId?: number
}

export interface LinkedQuestionMigrateResultDto {
  kaynak?: 'AppDb' | 'LegacyDb' | string
  parentLegacyQuestionId: number
  parentNewQuestionId: number
  newLinkedQuestionId: number
}
