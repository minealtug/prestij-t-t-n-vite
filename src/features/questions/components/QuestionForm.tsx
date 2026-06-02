import { useMemo, useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { getErrorMessage } from '@/lib/api/api-error'
import { useSurveys } from '@/features/surveys/hooks/use-surveys'
import { useAnswerInputTypes, useCreateQuestion } from '../hooks/use-questions'
import type { CreateQuestionRequest } from '../types/question.types'

const defaultForm = {
  baslikId: '',
  cevapGirdiTipId: '',
  soruMetni: '',
  zorunlu: true,
  aktif: true,
  bagliSoru: false,
}

export function QuestionForm() {
  const createQuestion = useCreateQuestion()
  const surveysQuery = useSurveys()
  const answerInputTypesQuery = useAnswerInputTypes()
  const [form, setForm] = useState(defaultForm)
  const [formError, setFormError] = useState('')
  const surveyOptions = useMemo(
    () =>
      (surveysQuery.data ?? []).map((survey) => ({
        key: `${survey.kaynak ?? 'unknown'}-${survey.id}`,
        value: String(survey.id),
        label: survey.kaynak ? `${survey.name} (${survey.kaynak})` : survey.name,
      })),
    [surveysQuery.data],
  )
  const cevapTipiOptions = useMemo(
    () => [
      { value: '', label: 'Cevap tipi seçin' },
      ...(answerInputTypesQuery.data ?? [])
        .slice()
        .sort((a, b) => a.siraNo - b.siraNo)
        .map((item) => ({ value: String(item.id), label: item.adi })),
    ],
    [answerInputTypesQuery.data],
  )

  const resetForm = () => {
    setForm(defaultForm)
    setFormError('')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setFormError('')

    const baslikId = Number(form.baslikId)
    const cevapGirdiTipId = Number(form.cevapGirdiTipId)
    if (!Number.isFinite(baslikId) || baslikId <= 0) {
      setFormError('Lütfen geçerli bir anket başlığı seçin.')
      return
    }
    if (!Number.isFinite(cevapGirdiTipId) || cevapGirdiTipId <= 0) {
      setFormError('Lütfen geçerli bir cevap tipi seçin.')
      return
    }
    if (!form.soruMetni.trim()) {
      setFormError('Soru metni boş olamaz.')
      return
    }

    const payload: CreateQuestionRequest = {
      baslikId,
      cevapGirdiTipId,
      soruMetni: form.soruMetni.trim(),
      zorunlu: form.zorunlu,
      aktif: form.aktif,
      bagliSoru: form.bagliSoru,
    }
    createQuestion.mutate(
      payload,
      {
        onSuccess: () => resetForm(),
      },
    )
  }

  return (
    <Card className="border-primary-500/20">
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">Yeni Soru Ekle</h3>
      </div>

      <form className="space-y-5" onSubmit={submit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Anket Başlığı"
            value={form.baslikId}
            onChange={(e) => setForm((f) => ({ ...f, baslikId: e.target.value }))}
            options={surveyOptions}
            required
          />
          <Select
            label="Cevap Tipi"
            value={form.cevapGirdiTipId}
            onChange={(e) => setForm((f) => ({ ...f, cevapGirdiTipId: e.target.value }))}
            options={cevapTipiOptions}
            disabled={answerInputTypesQuery.isLoading}
            required
          />
        </div>

        <Textarea
          label="Soru"
          value={form.soruMetni}
          onChange={(e) => setForm((f) => ({ ...f, soruMetni: e.target.value }))}
          placeholder="Soru metnini yazın"
          required
        />
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.zorunlu}
            onChange={(e) => setForm((f) => ({ ...f, zorunlu: e.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-foreground">Zorunlu</span>
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.aktif}
            onChange={(e) => setForm((f) => ({ ...f, aktif: e.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-foreground">Aktif</span>
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.bagliSoru}
            onChange={(e) => setForm((f) => ({ ...f, bagliSoru: e.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-foreground">Bağlı Soru</span>
        </label>

        {createQuestion.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {getErrorMessage(createQuestion.error)}
          </p>
        )}
        {formError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {formError}
          </p>
        )}
        {answerInputTypesQuery.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            Cevap tipi listesi alınamadı.
          </p>
        )}

        {createQuestion.isSuccess && (
          <p className="text-sm text-primary-600">Soru kaydedildi.</p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-border pt-4">
          <Button type="submit" loading={createQuestion.isPending}>
            <Save className="h-4 w-4" />
            Hemen Kaydet
          </Button>
        </div>
      </form>
    </Card>
  )
}
