export function needsSecenekGrup(cevapGirdiTipAdi: string) {
  const normalized = cevapGirdiTipAdi.trim().toLowerCase().replace(/\s+/g, ' ')
  return (
    normalized.includes('radio') ||
    normalized.includes('checkbox') ||
    normalized.includes('check box') ||
    normalized.includes('select') ||
    normalized.includes('combo')
  )
}
