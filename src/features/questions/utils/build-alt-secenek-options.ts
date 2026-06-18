import type { AltSecenekDto } from '../types/alt-secenek.types'

export function buildAltSecenekOptions(
  altSecenekler: AltSecenekDto[],
  secenekGrupId?: number,
  loading = false,
) {
  if (loading) {
    return [{ value: '', label: 'Alt seçenekler yükleniyor...' }]
  }

  if (!secenekGrupId || secenekGrupId <= 0) {
    return [{ value: '', label: 'Önce seçenek grubu seçin' }]
  }

  const filtered = altSecenekler
    .filter((item) => item.secenekGrupId === secenekGrupId)
    .sort((left, right) => {
      if (left.siraNo !== right.siraNo) return left.siraNo - right.siraNo
      return left.adi.localeCompare(right.adi, 'tr-TR')
    })

  return [
    { value: '', label: 'Alt seçenek seçin' },
    ...filtered.map((item) => ({
      value: String(item.id),
      label: item.adi,
    })),
  ]
}
