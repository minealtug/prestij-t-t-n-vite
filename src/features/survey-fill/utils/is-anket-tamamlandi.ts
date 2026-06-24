import type { AnketYanitOturumDto } from '../types/anket-yanit.types'
import { isEkiciProducerQuestion } from './is-ekici-producer-question'

export function isAnketTamamlandiForEkici(oturum: AnketYanitOturumDto | undefined): boolean {
  if (!oturum?.tamamlanabilir) return false

  const { yanitlananSoruSayisi, toplamGorunurSoruSayisi } = oturum
  if (
    yanitlananSoruSayisi != null &&
    toplamGorunurSoruSayisi != null &&
    toplamGorunurSoruSayisi > 0
  ) {
    return yanitlananSoruSayisi >= toplamGorunurSoruSayisi
  }

  const visibleQuestions = oturum.sorular.filter(
    (soru) => soru.gorunur && !isEkiciProducerQuestion(soru),
  )
  if (visibleQuestions.length === 0) return false

  return visibleQuestions.every((soru) => soru.yanitlandi)
}
