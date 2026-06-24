export interface EkiciDto {
  id: string
  adi: string
  soyad: string
  mintikaId: number | null
  /** 1 = aktif, 0 = pasif */
  aktif: number
}
