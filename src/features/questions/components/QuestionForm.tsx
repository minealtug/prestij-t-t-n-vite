import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { getErrorMessage } from '@/lib/api/api-error'
import { useSurveys } from '@/features/surveys/hooks/use-surveys'
import { useAnswerUnits } from '@/features/answer-units/hooks/use-answer-units'
import { useSecenekGruplari } from '../hooks/use-secenek-gruplari'
import {
  useAnswerInputTypes,
  useCreateLinkedQuestionWithMigrate,
  useCreateNewLinkedQuestion,
  useCreateQuestion,
  useLinkExistingQuestion,
  useQuestions,
} from '../hooks/use-questions'
import type {
  CreateLinkedQuestionPayload,
  CreateNewLinkedQuestionRequest,
  CreateQuestionRequest,
  LinkedQuestionMigrateResultDto,
  QuestionConnectionDto,
} from '../types/question.types'
import { getFriendlyAnswerTypeLabel } from '../utils/answer-type-label'
import { needsSecenekGrup } from '../utils/needs-secenek-grup'
import { buildAltSecenekOptions } from '../utils/build-alt-secenek-options'

type LinkedMode = 'yeni' | 'mevcut'

interface LinkedChildDraft {
  key: string
  cevapGirdiTipId: string
  bagliAltSecenekId: string
  soruMetni: string
  zorunlu: boolean
  aktif: boolean
}

const defaultForm = {
  baslikId: '',
  cevapGirdiTipId: '',
  secenekGrupId: '',
  altSecenekId: '',
  anketCevapBirimId: '',
  soruMetni: '',
  zorunlu: true,
  aktif: true,
  bagliSoru: false,
}

let linkedChildKey = 0

function createLinkedChildDraft(): LinkedChildDraft {
  linkedChildKey += 1
  return {
    key: `linked-child-${linkedChildKey}`,
    cevapGirdiTipId: '',
    bagliAltSecenekId: '',
    soruMetni: '',
    zorunlu: true,
    aktif: true,
  }
}

interface QuestionFormProps {
  readOnly?: boolean
}

export function QuestionForm({ readOnly = false }: QuestionFormProps) {
  const createQuestion = useCreateQuestion()
  const createNewLinkedQuestion = useCreateNewLinkedQuestion()
  const linkExistingQuestion = useLinkExistingQuestion()
  const createLinkedQuestionWithMigrate = useCreateLinkedQuestionWithMigrate()
  const surveysQuery = useSurveys()
  const answerInputTypesQuery = useAnswerInputTypes()
  const answerUnitsQuery = useAnswerUnits()
  const secenekGruplariQuery = useSecenekGruplari()
  const [form, setForm] = useState(defaultForm)
  const [linkedMode, setLinkedMode] = useState<LinkedMode>('yeni')
  const [parentQuestionId, setParentQuestionId] = useState('')
  const [existingLinkedQuestionId, setExistingLinkedQuestionId] = useState('')
  const [bagliAltSecenekId, setBagliAltSecenekId] = useState('')
  const [linkedChildren, setLinkedChildren] = useState<LinkedChildDraft[]>([])
  const [formError, setFormError] = useState('')
  const [linkedMigrateResult, setLinkedMigrateResult] = useState<LinkedQuestionMigrateResultDto | null>(null)
  const [linkedConnectionResult, setLinkedConnectionResult] = useState<QuestionConnectionDto | null>(null)
  const selectedBaslikId = Number(form.baslikId)
  const questionsBySurveyQuery = useQuestions(selectedBaslikId > 0 ? selectedBaslikId : undefined)

  const surveyOptions = useMemo(
    () =>
      (surveysQuery.data ?? []).map((survey) => ({
        key: `${survey.kaynak ?? 'unknown'}-${survey.id}`,
        value: String(survey.id),
        label: survey.name,
      })),
    [surveysQuery.data],
  )

  const cevapTipiOptions = useMemo(() => {
    const options = (answerInputTypesQuery.data ?? [])
      .sort((a, b) => a.siraNo - b.siraNo)
      .map((item) => {
        const friendly = getFriendlyAnswerTypeLabel(item.adi)
        return {
          value: String(item.id),
          label: friendly === item.adi ? friendly : `${friendly} (${item.adi})`,
        }
      })

    return [{ value: '', label: 'Cevap tipi seçin' }, ...options]
  }, [answerInputTypesQuery.data])

  const birimOptions = useMemo(
    () => [
      {
        value: '',
        label: answerUnitsQuery.isLoading ? 'Birimler yükleniyor...' : 'Birim seçin',
      },
      ...(answerUnitsQuery.data ?? []).map((unit) => ({
        value: String(unit.id),
        label: unit.adi,
      })),
    ],
    [answerUnitsQuery.data, answerUnitsQuery.isLoading],
  )

  const selectedAnswerType = useMemo(
    () =>
      (answerInputTypesQuery.data ?? []).find((item) => String(item.id) === form.cevapGirdiTipId),
    [answerInputTypesQuery.data, form.cevapGirdiTipId],
  )

  const showSecenekGrup = selectedAnswerType ? needsSecenekGrup(selectedAnswerType.adi) : false

  const secenekGrupOptions = useMemo(
    () => [
      {
        value: '',
        label: secenekGruplariQuery.isLoading
          ? 'Seçenek grupları yükleniyor...'
          : 'Seçenek grubu seçin',
      },
      ...secenekGruplariQuery.secenekGruplari.map((grup) => ({
        value: String(grup.id),
        label: grup.label,
      })),
    ],
    [secenekGruplariQuery.isLoading, secenekGruplariQuery.secenekGruplari],
  )

  const selectedSecenekGrupId = Number(form.secenekGrupId)

  const altSecenekOptions = useMemo(
    () =>
      buildAltSecenekOptions(
        secenekGruplariQuery.data ?? [],
        Number.isFinite(selectedSecenekGrupId) && selectedSecenekGrupId > 0
          ? selectedSecenekGrupId
          : undefined,
        secenekGruplariQuery.isLoading,
      ),
    [secenekGruplariQuery.data, secenekGruplariQuery.isLoading, selectedSecenekGrupId],
  )

  const selectedParentQuestion = useMemo(
    () =>
      (questionsBySurveyQuery.data ?? []).find((question) => String(question.id) === parentQuestionId),
    [parentQuestionId, questionsBySurveyQuery.data],
  )

  const parentSecenekGrupId = selectedParentQuestion?.secenekGrupId ?? undefined

  const parentAltSecenekOptions = useMemo(
    () =>
      buildAltSecenekOptions(
        secenekGruplariQuery.data ?? [],
        parentSecenekGrupId ?? undefined,
        secenekGruplariQuery.isLoading,
      ),
    [parentSecenekGrupId, secenekGruplariQuery.data, secenekGruplariQuery.isLoading],
  )

  const questionOptions = useMemo(
    () =>
      (questionsBySurveyQuery.data ?? []).map((question) => ({
        value: String(question.id),
        label: `[${question.kaynak ?? 'Bilinmiyor'}] #${question.id} - ${question.soruMetni}`,
      })),
    [questionsBySurveyQuery.data],
  )

  const parentQuestionOptions = useMemo(
    () => [{ value: '', label: 'Bağlı olunacak soru seçin' }, ...questionOptions],
    [questionOptions],
  )

  const existingQuestionOptions = useMemo(() => {
    const filtered = questionOptions.filter((option) => option.value !== parentQuestionId)
    return [{ value: '', label: 'Bağlanacak mevcut soru seçin' }, ...filtered]
  }, [parentQuestionId, questionOptions])

  const isSubmitting =
    createQuestion.isPending ||
    createNewLinkedQuestion.isPending ||
    linkExistingQuestion.isPending ||
    createLinkedQuestionWithMigrate.isPending

  const resetForm = () => {
    setForm(defaultForm)
    setLinkedMode('yeni')
    setParentQuestionId('')
    setExistingLinkedQuestionId('')
    setBagliAltSecenekId('')
    setLinkedChildren([])
    setFormError('')
  }

  const buildQuestionFields = (
    baslikId: number,
    cevapGirdiTipId: number,
    soruMetni: string,
    zorunlu: boolean,
    aktif: boolean,
    anketCevapBirimId?: number,
    secenekGrupId?: number,
  ): Omit<CreateQuestionRequest, 'bagliSoru' | 'bagliSorular'> => ({
    baslikId,
    cevapGirdiTipId,
    soruMetni,
    zorunlu,
    aktif,
    ...(anketCevapBirimId != null && anketCevapBirimId > 0 ? { anketCevapBirimId } : {}),
    ...(secenekGrupId != null && secenekGrupId > 0 ? { secenekGrupId } : {}),
  })

  const mapLinkedChildren = (
    children: LinkedChildDraft[],
    mainSecenekGrupId?: number,
  ): CreateLinkedQuestionPayload[] | null => {
    const mapped: CreateLinkedQuestionPayload[] = []

    for (const child of children) {
      const cevapGirdiTipId = Number(child.cevapGirdiTipId)
      const soruMetni = child.soruMetni.trim()
      const parsedBagliAltSecenekId = Number(child.bagliAltSecenekId)
      const bagliAltSecenekId =
        Number.isFinite(parsedBagliAltSecenekId) && parsedBagliAltSecenekId > 0
          ? parsedBagliAltSecenekId
          : undefined

      if (!Number.isFinite(cevapGirdiTipId) || cevapGirdiTipId <= 0) {
        setFormError('Bağlı sorular için geçerli cevap tipi seçin.')
        return null
      }
      if (!soruMetni) {
        setFormError('Bağlı soru metni boş olamaz.')
        return null
      }
      if (mainSecenekGrupId && !bagliAltSecenekId) {
        setFormError('Bağlı sorular için alt seçenek seçmelisiniz.')
        return null
      }

      mapped.push({
        cevapGirdiTipId,
        soruMetni,
        zorunlu: child.zorunlu,
        aktif: child.aktif,
        ...(bagliAltSecenekId ? { bagliAltSecenekId } : {}),
        ...(mainSecenekGrupId ? { secenekGrupId: mainSecenekGrupId } : {}),
      })
    }

    return mapped
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (readOnly) return
    setFormError('')
    setLinkedMigrateResult(null)
    setLinkedConnectionResult(null)

    const baslikId = Number(form.baslikId)
    if (!Number.isFinite(baslikId) || baslikId <= 0) {
      setFormError('Lütfen geçerli bir anket başlığı seçin.')
      return
    }

    const parsedParentQuestionId = Number(parentQuestionId)
    if (form.bagliSoru && (!Number.isFinite(parsedParentQuestionId) || parsedParentQuestionId <= 0)) {
      setFormError('Bağlı soru için parent soru seçmelisiniz.')
      return
    }

    if (form.bagliSoru && linkedMode === 'mevcut') {
      const parsedExistingQuestionId = Number(existingLinkedQuestionId)
      if (!Number.isFinite(parsedExistingQuestionId) || parsedExistingQuestionId <= 0) {
        setFormError('Bağlanacak mevcut soru seçmelisiniz.')
        return
      }

      const parsedBagliAltSecenekId = Number(bagliAltSecenekId)
      const bagliAltSecenekIdValue =
        Number.isFinite(parsedBagliAltSecenekId) && parsedBagliAltSecenekId > 0
          ? parsedBagliAltSecenekId
          : undefined

      if (parentSecenekGrupId && !bagliAltSecenekIdValue) {
        setFormError('Bağlı sorunun hangi alt seçenekte görüneceğini seçmelisiniz.')
        return
      }

      linkExistingQuestion.mutate(
        {
          parentId: parsedParentQuestionId,
          payload: {
            bagliSoruId: parsedExistingQuestionId,
            ...(bagliAltSecenekIdValue ? { bagliAltSecenekId: bagliAltSecenekIdValue } : {}),
          },
        },
        {
          onSuccess: (result) => {
            setLinkedConnectionResult(result)
            resetForm()
          },
        },
      )
      return
    }

    const cevapGirdiTipId = Number(form.cevapGirdiTipId)
    if (!Number.isFinite(cevapGirdiTipId) || cevapGirdiTipId <= 0) {
      setFormError('Lütfen geçerli bir cevap tipi seçin.')
      return
    }
    if (!form.soruMetni.trim()) {
      setFormError('Soru metni boş olamaz.')
      return
    }

    const parsedAnketCevapBirimId = Number(form.anketCevapBirimId)
    const anketCevapBirimId =
      Number.isFinite(parsedAnketCevapBirimId) && parsedAnketCevapBirimId > 0
        ? parsedAnketCevapBirimId
        : undefined

    const parsedSecenekGrupId = Number(form.secenekGrupId)
    const secenekGrupId =
      Number.isFinite(parsedSecenekGrupId) && parsedSecenekGrupId > 0 ? parsedSecenekGrupId : undefined

    if (showSecenekGrup && !secenekGrupId) {
      setFormError('Seçenekli cevap tipleri için seçenek grubu seçmelisiniz.')
      return
    }

    const questionFields = buildQuestionFields(
      baslikId,
      cevapGirdiTipId,
      form.soruMetni.trim(),
      form.zorunlu,
      form.aktif,
      anketCevapBirimId,
      secenekGrupId,
    )

    const parsedBagliAltSecenekId = Number(bagliAltSecenekId)
    const bagliAltSecenekIdValue =
      Number.isFinite(parsedBagliAltSecenekId) && parsedBagliAltSecenekId > 0
        ? parsedBagliAltSecenekId
        : undefined

    if (form.bagliSoru) {
      if (parentSecenekGrupId && !bagliAltSecenekIdValue) {
        setFormError('Bağlı sorunun hangi alt seçenekte görüneceğini seçmelisiniz.')
        return
      }

      if (selectedParentQuestion?.kaynak === 'LegacyDb') {
        createLinkedQuestionWithMigrate.mutate(
          {
            ...questionFields,
            parentLegacyQuestionId: parsedParentQuestionId,
            ...(bagliAltSecenekIdValue ? { bagliLegacyAltSecenekId: bagliAltSecenekIdValue } : {}),
          },
          {
            onSuccess: (result) => {
              setLinkedMigrateResult(result)
              resetForm()
            },
          },
        )
        return
      }

      createNewLinkedQuestion.mutate(
        {
          parentId: parsedParentQuestionId,
          payload: {
            ...questionFields,
            ...(bagliAltSecenekIdValue ? { bagliAltSecenekId: bagliAltSecenekIdValue } : {}),
          },
        },
        {
          onSuccess: () => resetForm(),
        },
      )
      return
    }

    const bagliSorular =
      linkedChildren.length > 0 ? mapLinkedChildren(linkedChildren, secenekGrupId) : undefined
    if (linkedChildren.length > 0 && !bagliSorular) return

    const payload: CreateQuestionRequest = {
      ...questionFields,
      bagliSoru: false,
      ...(bagliSorular ? { bagliSorular } : {}),
    }

    createQuestion.mutate(payload, {
      onSuccess: () => resetForm(),
    })
  }

  const submitError =
    createQuestion.error ??
    createNewLinkedQuestion.error ??
    linkExistingQuestion.error ??
    createLinkedQuestionWithMigrate.error

  const showQuestionFields = !form.bagliSoru || linkedMode === 'yeni'

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
            onChange={(e) => {
              setForm((f) => ({ ...f, baslikId: e.target.value }))
              setParentQuestionId('')
              setExistingLinkedQuestionId('')
              setLinkedMigrateResult(null)
              setLinkedConnectionResult(null)
            }}
            options={surveyOptions}
            required
          />
          {showQuestionFields && (
            <Select
              label="Cevap Tipi"
              value={form.cevapGirdiTipId}
              onChange={(e) => setForm((f) => ({ ...f, cevapGirdiTipId: e.target.value }))}
              options={cevapTipiOptions}
              disabled={answerInputTypesQuery.isLoading}
              required
            />
          )}
          {showQuestionFields && (
            <Select
              label="Seçenek Grup"
              value={form.secenekGrupId}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  secenekGrupId: e.target.value,
                  altSecenekId: '',
                }))
              }
              options={secenekGrupOptions}
              disabled={secenekGruplariQuery.isLoading}
              required={showSecenekGrup}
            />
          )}
          {showQuestionFields && form.secenekGrupId && (
            <Select
              label="Alt Seçenek"
              value={form.altSecenekId}
              onChange={(e) => setForm((f) => ({ ...f, altSecenekId: e.target.value }))}
              options={altSecenekOptions}
              disabled={secenekGruplariQuery.isLoading}
            />
          )}
          {showQuestionFields && (
            <Select
              label="Birim"
              value={form.anketCevapBirimId}
              onChange={(e) => setForm((f) => ({ ...f, anketCevapBirimId: e.target.value }))}
              options={birimOptions}
              disabled={answerUnitsQuery.isLoading}
            />
          )}
        </div>

        {showQuestionFields && (
          <Textarea
            label="Soru"
            value={form.soruMetni}
            onChange={(e) => setForm((f) => ({ ...f, soruMetni: e.target.value }))}
            placeholder="Soru metnini yazın"
            required
          />
        )}

        {showQuestionFields && (
          <div className="flex flex-wrap gap-6">
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
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.bagliSoru}
            onChange={(e) => {
              const checked = e.target.checked
              setForm((f) => ({ ...f, bagliSoru: checked }))
              setLinkedChildren([])
              if (!checked) {
                setParentQuestionId('')
                setExistingLinkedQuestionId('')
                setBagliAltSecenekId('')
                setLinkedMode('yeni')
                setLinkedMigrateResult(null)
                setLinkedConnectionResult(null)
              }
            }}
            className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-foreground">Bağlı Soru</span>
        </label>

        {form.bagliSoru && (
          <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-sm text-muted">
              Mevcut bir soruya bağlı soru ekleyin. İç içe bağlantı için bağlı sorunun ID&apos;sini parent
              olarak seçebilirsiniz.
            </p>

            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="linked-mode"
                  checked={linkedMode === 'yeni'}
                  onChange={() => setLinkedMode('yeni')}
                  className="h-4 w-4 border-border text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-foreground">Yeni bağlı soru oluştur</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="linked-mode"
                  checked={linkedMode === 'mevcut'}
                  onChange={() => setLinkedMode('mevcut')}
                  className="h-4 w-4 border-border text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-foreground">Mevcut soruyu bağla</span>
              </label>
            </div>

            <Select
              label="Bağlı olunacak soru (parent)"
              value={parentQuestionId}
              onChange={(e) => {
                setParentQuestionId(e.target.value)
                setBagliAltSecenekId('')
                if (e.target.value === existingLinkedQuestionId) {
                  setExistingLinkedQuestionId('')
                }
              }}
              options={parentQuestionOptions}
              disabled={!form.baslikId || questionsBySurveyQuery.isLoading}
              required
            />

            {linkedMode === 'mevcut' && (
              <Select
                label="Bağlanacak mevcut soru"
                value={existingLinkedQuestionId}
                onChange={(e) => setExistingLinkedQuestionId(e.target.value)}
                options={existingQuestionOptions}
                disabled={!form.baslikId || questionsBySurveyQuery.isLoading}
                required
              />
            )}

            {parentSecenekGrupId && (
              <Select
                label="Alt Seçenek"
                value={bagliAltSecenekId}
                onChange={(e) => setBagliAltSecenekId(e.target.value)}
                options={parentAltSecenekOptions}
                disabled={secenekGruplariQuery.isLoading}
                required
              />
            )}
          </div>
        )}

        {!form.bagliSoru && (
          <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-medium text-foreground">Bağlı Sorular (isteğe bağlı)</h4>
                <p className="text-xs text-muted">
                  Ana soru ile birlikte yeni bağlı sorular oluşturmak için ekleyin.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={readOnly}
                onClick={() => setLinkedChildren((items) => [...items, createLinkedChildDraft()])}
              >
                <Plus className="h-4 w-4" />
                Bağlı soru ekle
              </Button>
            </div>

            {linkedChildren.length === 0 ? (
              <p className="text-sm text-muted">Henüz bağlı soru eklenmedi.</p>
            ) : (
              <div className="space-y-3">
                {linkedChildren.map((child, index) => (
                  <div key={child.key} className="space-y-3 rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">Bağlı soru {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="!h-8 !px-2 text-red-600"
                        disabled={readOnly}
                        onClick={() =>
                          setLinkedChildren((items) => items.filter((item) => item.key !== child.key))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        Kaldır
                      </Button>
                    </div>

                    <Select
                      label="Cevap Tipi"
                      value={child.cevapGirdiTipId}
                      onChange={(e) =>
                        setLinkedChildren((items) =>
                          items.map((item) =>
                            item.key === child.key ? { ...item, cevapGirdiTipId: e.target.value } : item,
                          ),
                        )
                      }
                      options={cevapTipiOptions}
                      disabled={answerInputTypesQuery.isLoading}
                      required
                    />

                    {form.secenekGrupId && (
                      <Select
                        label="Alt Seçenek"
                        value={child.bagliAltSecenekId}
                        onChange={(e) =>
                          setLinkedChildren((items) =>
                            items.map((item) =>
                              item.key === child.key
                                ? { ...item, bagliAltSecenekId: e.target.value }
                                : item,
                            ),
                          )
                        }
                        options={altSecenekOptions}
                        disabled={secenekGruplariQuery.isLoading}
                        required
                      />
                    )}

                    <Textarea
                      label="Soru"
                      value={child.soruMetni}
                      onChange={(e) =>
                        setLinkedChildren((items) =>
                          items.map((item) =>
                            item.key === child.key ? { ...item, soruMetni: e.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Bağlı soru metnini yazın"
                      required
                    />

                    <div className="flex flex-wrap gap-6">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={child.zorunlu}
                          onChange={(e) =>
                            setLinkedChildren((items) =>
                              items.map((item) =>
                                item.key === child.key ? { ...item, zorunlu: e.target.checked } : item,
                              ),
                            )
                          }
                          className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-foreground">Zorunlu</span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={child.aktif}
                          onChange={(e) =>
                            setLinkedChildren((items) =>
                              items.map((item) =>
                                item.key === child.key ? { ...item, aktif: e.target.checked } : item,
                              ),
                            )
                          }
                          className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-foreground">Aktif</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {submitError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {getErrorMessage(submitError)}
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
        {secenekGruplariQuery.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            Seçenek grubu listesi alınamadı.
          </p>
        )}

        {createQuestion.isSuccess && (
          <p className="text-sm text-primary-600">Soru kaydedildi.</p>
        )}
        {createNewLinkedQuestion.isSuccess && (
          <p className="text-sm text-primary-600">Yeni bağlı soru oluşturuldu.</p>
        )}
        {linkedConnectionResult && (
          <p className="text-sm text-primary-600">
            Mevcut soru bağlandı. Bağlantı ID: {linkedConnectionResult.id}
          </p>
        )}
        {linkedMigrateResult && (
          <p className="text-sm text-primary-600">
            Bağlı soru migrate edilerek kaydedildi. Kaynak: {linkedMigrateResult.kaynak ?? 'AppDb'}.
            Yeni Parent ID: {linkedMigrateResult.parentNewQuestionId}, Yeni Bağlı Soru ID:{' '}
            {linkedMigrateResult.newLinkedQuestionId}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
          <Button type="submit" disabled={readOnly} loading={isSubmitting}>
            <Save className="h-4 w-4" />
            Kaydet
          </Button>
        </div>
      </form>
    </Card>
  )
}
