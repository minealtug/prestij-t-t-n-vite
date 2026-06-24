import type { AnketCevapOzetItem } from '../types/survey-response.types'

export interface SurveyResponseStats {
  toplamKayitSayisi: number
  tamamlananAnketSayisi: number
  tamamlanmayanAnketSayisi: number
  tamamlanmaOrani: number | null
}

export function isAnketKaydiTamamlandi(
  item: Pick<AnketCevapOzetItem, 'yanitlananSoruSayisi' | 'yanitlanmayanSoruSayisi'>,
): boolean {
  return item.yanitlanmayanSoruSayisi === 0 && item.yanitlananSoruSayisi > 0
}

export function computeSurveyResponseStats(items: AnketCevapOzetItem[]): SurveyResponseStats {
  const toplamKayitSayisi = items.length
  let tamamlananAnketSayisi = 0

  for (const item of items) {
    if (isAnketKaydiTamamlandi(item)) {
      tamamlananAnketSayisi += 1
    }
  }

  const tamamlanmayanAnketSayisi = toplamKayitSayisi - tamamlananAnketSayisi
  const tamamlanmaOrani =
    toplamKayitSayisi > 0
      ? Math.round((tamamlananAnketSayisi / toplamKayitSayisi) * 100)
      : null

  return {
    toplamKayitSayisi,
    tamamlananAnketSayisi,
    tamamlanmayanAnketSayisi,
    tamamlanmaOrani,
  }
}
