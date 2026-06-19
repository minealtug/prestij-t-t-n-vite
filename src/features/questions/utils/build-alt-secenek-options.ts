import type { AltSecenekDto } from '../types/alt-secenek.types'

export function buildAltSecenekOptionsFromQuery(
  altSecenekler: AltSecenekDto[],
  secenekGrupId?: number,
) {
  if (!secenekGrupId || secenekGrupId <= 0) {
    return [{ value: '', label: 'Önce seçenek grubu seçin' }]
  }

  const grupId = Number(secenekGrupId)
  const filtered = altSecenekler
    .filter((item) => Number(item.secenekGrupId) === grupId)
    .sort((left, right) => {
      if (left.siraNo !== right.siraNo) return left.siraNo - right.siraNo
      return left.adi.localeCompare(right.adi, 'tr-TR')
    })

  if (filtered.length === 0) {
    return [{ value: '', label: 'Bu gruba ait alt seçenek bulunamadı' }]
  }

  return [
    { value: '', label: 'Alt seçenek seçin' },
    ...filtered.map((item) => ({
      value: String(item.id),
      label: item.adi,
    })),
  ]
}

export function buildAltSecenekOptions(
  altSecenekler: AltSecenekDto[],
  secenekGrupId?: number,
  loading = false,
) {
  if (loading) {
    return [{ value: '', label: 'Alt seçenekler yükleniyor...' }]
  }

  return buildAltSecenekOptionsFromQuery(altSecenekler, secenekGrupId)
}
