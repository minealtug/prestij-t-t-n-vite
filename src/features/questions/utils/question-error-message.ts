import { isAppError, normalizeApiError } from '@/lib/api/api-error'

export type QuestionErrorContext = 'delete' | 'create' | 'update' | 'generic'

function isGenericHttpMessage(message: string): boolean {
  const trimmed = message.trim()
  return (
    /^request failed with status code \d+$/i.test(trimmed) ||
    trimmed === 'İstek başarısız oldu' ||
    trimmed === 'İstek geçersiz veya iş kurallarına uymuyor.' ||
    trimmed === 'Network Error'
  )
}

function collectErrorHaystack(error: unknown): { status: number; text: string; message: string } {
  const normalized = isAppError(error) ? error : normalizeApiError(error)
  const parts = [normalized.message]

  if (normalized.fieldErrors) {
    for (const messages of Object.values(normalized.fieldErrors)) {
      parts.push(...messages)
    }
  }

  return {
    status: normalized.status,
    text: parts.join(' ').toLowerCase(),
    message: normalized.message,
  }
}

function hasLinkedChildPattern(text: string): boolean {
  return (
    /(bagli|bağlı|linked).*(alt|child|children).*(soru|question)/i.test(text) ||
    /(alt|child).*(bagli|bağlı|linked).*(soru|question)/i.test(text) ||
    /has.*linked.*question/i.test(text) ||
    /linked.*question.*(exist|var|bulun)/i.test(text) ||
    /(soru|question).*(bagli|bağlı|linked).*(soru|question).*(var|exist|bulun)/i.test(text)
  )
}

function hasLinkedToParentPattern(text: string): boolean {
  return (
    /(bagli|bağlı|linked).*(ana|parent|üst|ust).*(soru|question)/i.test(text) ||
    /(ana|parent|üst|ust).*(soru|question).*(bagli|bağlı|linked)/i.test(text) ||
    /(bir|another).*(soru|question).*(bagli|bağlı|linked)/i.test(text)
  )
}

function hasAnswerBlockingPattern(text: string): boolean {
  return /(cevap|yanit|yanıt|answer|response).*(var|exist|bulun|kayit|kayıt)/i.test(text)
}

function getContextFallback(context: QuestionErrorContext, status: number): string {
  if (context === 'delete') {
    if (status === 404) return 'Silinmek istenen soru bulunamadı.'
    if (status === 403) return 'Bu soruyu silme yetkiniz yok.'
    return 'Soru silinemedi. Bağlı sorular veya mevcut cevaplar nedeniyle işlem tamamlanamadı.'
  }

  if (context === 'create') {
    if (status === 404) return 'İlgili anket veya kayıt bulunamadı.'
    if (status === 403) return 'Soru ekleme yetkiniz yok.'
    return 'Soru eklenemedi. Girdiğiniz bilgileri kontrol edip tekrar deneyin.'
  }

  if (context === 'update') {
    if (status === 404) return 'Güncellenecek soru bulunamadı.'
    if (status === 403) return 'Bu soruyu güncelleme yetkiniz yok.'
    return 'Soru güncellenemedi. Girdiğiniz bilgileri kontrol edip tekrar deneyin.'
  }

  return 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'
}

export function getFriendlyQuestionErrorMessage(
  error: unknown,
  context: QuestionErrorContext = 'generic',
): string {
  const { status, text, message } = collectErrorHaystack(error)

  if (context === 'delete' || context === 'generic') {
    if (hasLinkedChildPattern(text)) {
      return 'Bu sorunun bağlı alt soruları var. Ana soruyu silmeden önce bağlı soruları silin veya bağlantıyı kaldırın.'
    }

    if (hasLinkedToParentPattern(text)) {
      return 'Bu soru başka bir soruya bağlı. Silmeden önce bağlı sorunun bağlantısını kaldırın.'
    }

    if (hasAnswerBlockingPattern(text)) {
      return 'Bu soruya verilmiş cevaplar olduğu için silinemez.'
    }
  }

  if (context === 'create' || context === 'generic') {
    if (/(duplicate|zaten|already|mevcut).*(soru|question)/i.test(text)) {
      return 'Bu soru zaten tanımlı görünüyor. Soru metnini veya bağlantıyı kontrol edin.'
    }

    if (hasLinkedToParentPattern(text) && /(secenek|seçenek|option|grup)/i.test(text)) {
      return 'Bağlı soru eklenemedi. Seçenek grubu ve görünme koşulunu kontrol edin.'
    }

    if (/(baslik|başlık|anket).*(bulunamad|not found|geçersiz|invalid)/i.test(text)) {
      return 'Seçili anket geçersiz veya bulunamadı. Lütfen anket seçimini kontrol edin.'
    }
  }

  if (!isGenericHttpMessage(message)) {
    return message
  }

  return getContextFallback(context, status)
}
