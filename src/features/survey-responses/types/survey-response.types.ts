export interface EkiciDto {
  id: string
  adi: string
  soyad: string | null
}

export function formatEkiciLabel(ekici: Pick<EkiciDto, 'adi' | 'soyad' | 'id'>): string {
  const label = [ekici.adi, ekici.soyad].filter(Boolean).join(' ').trim()
  return label || ekici.id
}

export interface AnketCevapDto {
  id: string
  soruId: number
  soruMetni: string
  ekiciId: string
  ekiciAd: string
  ekiciSoyad: string
  sablonId: number
  sablonAdi: string
  mintikaId: number
  mintikaAdi: string
  kullaniciId: number
  islemTarihi: string
  cevapAltSecenekId: number | null
  cevapAltSecenekAdi: string | null
  cevapText: string | null
  cevapNumeric: number | null
  cevapDatetime: string | null
  birimId: number | null
  kaynak: string | null
}

export interface ResponseAnswerDetail {
  questionNo: number
  questionText: string
  answer: string
}

export interface SurveyResponseGroup {
  id: string
  submittedAt: string
  username: string
  fullName: string
  surveyName: string
  mintikaAdi: string
  answers: ResponseAnswerDetail[]
}

export interface SurveyResponsesQueryParams {
  ekiciId?: string
  search?: string
}
