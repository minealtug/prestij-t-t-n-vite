import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { getErrorMessage } from '@/lib/api/api-error'
import { QuestionForm } from '../components/QuestionForm'
import { QuestionsTable } from '../components/QuestionsTable'
import {
  useDeleteQuestion,
  useQuestions,
  useSetQuestionActive,
  useUpdateBagliKosul,
  useUpdateQuestion,
} from '../hooks/use-questions'
import { useSurveys } from '@/features/surveys/hooks/use-surveys'
import { PageContainer } from '@/components/layout/PageContainer'
import { useRequirePagePermission } from '@/features/permissions/hooks/use-require-page-permission'
import {
  BAGLI_KOSUL_ESIT,
  BAGLI_KOSUL_TIPI_OPTIONS,
  normalizeBagliKosulTipi,
} from '../utils/bagli-kosul-tipi'
import { GORUNME_KOSULU_LABEL } from '../utils/question-field-labels'
import type { QuestionDto } from '../types/question.types'

export function QuestionsPage() {
  const location = useLocation()
  const { canRead, canEdit, loading: permissionLoading } = useRequirePagePermission()
  const isDefinitionsPage = location.pathname.startsWith('/tanimlamalar')
  const surveysQuery = useSurveys()
  const updateQuestion = useUpdateQuestion()
  const updateBagliKosul = useUpdateBagliKosul()
  const setQuestionActive = useSetQuestionActive()
  const deleteQuestion = useDeleteQuestion()
  const [selectedSurveyId, setSelectedSurveyId] = useState(0)
  const [editingQuestion, setEditingQuestion] = useState<QuestionDto | null>(null)
  const [editText, setEditText] = useState('')
  const [editBagliKosulTipi, setEditBagliKosulTipi] = useState(BAGLI_KOSUL_ESIT)
  const questionsQuery = useQuestions(isDefinitionsPage ? selectedSurveyId : undefined)

  useEffect(() => {
    if (!isDefinitionsPage) return
    if (selectedSurveyId > 0) return
    const firstSurveyId = Number(surveysQuery.data?.[0]?.id)
    if (firstSurveyId > 0) setSelectedSurveyId(firstSurveyId)
  }, [isDefinitionsPage, selectedSurveyId, surveysQuery.data])

  const openEditModal = (question: QuestionDto) => {
    if (!canEdit) return
    setEditingQuestion(question)
    setEditText(question.soruMetni)
    setEditBagliKosulTipi(normalizeBagliKosulTipi(question.bagliKosulTipi))
  }

  const closeEditModal = () => {
    setEditingQuestion(null)
    setEditText('')
    setEditBagliKosulTipi(BAGLI_KOSUL_ESIT)
  }

  const handleEditSave = async () => {
    if (!canEdit || !editingQuestion || !editText.trim()) return

    const textChanged = editText.trim() !== editingQuestion.soruMetni
    const kosulChanged =
      editingQuestion.bagliSoru &&
      normalizeBagliKosulTipi(editBagliKosulTipi) !==
        normalizeBagliKosulTipi(editingQuestion.bagliKosulTipi)

    if (!textChanged && !kosulChanged) {
      closeEditModal()
      return
    }

    try {
      if (textChanged) {
        await updateQuestion.mutateAsync({
          id: editingQuestion.id,
          payload: {
            soruMetni: editText.trim(),
            aktif: editingQuestion.aktif,
            zorunlu: editingQuestion.zorunlu,
            ...(editingQuestion.kaynak === 'AppDb' ? { baslikId: editingQuestion.baslikId } : {}),
          },
        })
      }

      if (kosulChanged) {
        await updateBagliKosul.mutateAsync({
          id: editingQuestion.id,
          payload: { bagliKosulTipi: normalizeBagliKosulTipi(editBagliKosulTipi) },
        })
      }

      closeEditModal()
    } catch {
      // Hata mesajlari mutation state uzerinden gosterilir.
    }
  }

  const handleSetPassive = (question: QuestionDto) => {
    if (!canEdit || !question.aktif) return
    if (!window.confirm('Bu soruyu pasife almak istediğinize emin misiniz?')) return
    setQuestionActive.mutate({
      id: question.id,
      aktif: false,
    })
  }

  const handleDelete = (question: QuestionDto) => {
    if (!canEdit || question.kaynak !== 'AppDb') return
    if (!window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) return
    deleteQuestion.mutate(question.id)
  }

  const isMutating =
    updateQuestion.isPending ||
    updateBagliKosul.isPending ||
    setQuestionActive.isPending ||
    deleteQuestion.isPending

  const surveySelectOptions = (surveysQuery.data ?? []).map((survey) => ({
    key: `${survey.kaynak ?? 'unknown'}-${survey.id}`,
    value: String(survey.id),
    label: survey.name,
  }))

  const currentQuestions =
    isDefinitionsPage && selectedSurveyId <= 0 ? [] : (questionsQuery.data ?? [])

  const refreshQuestions = () => {
    void questionsQuery.refetch()
    if (isDefinitionsPage && selectedSurveyId > 0) {
      void surveysQuery.refetch()
    }
  }

  const getDefinitionsError = () => {
    if (!isDefinitionsPage) return questionsQuery.error
    if (selectedSurveyId <= 0) return null
    return questionsQuery.error
  }

  const isDefinitionsLoading = isDefinitionsPage && selectedSurveyId > 0 ? questionsQuery.isLoading : false

  if (permissionLoading) {
    return (
      <PageContainer>
        <p className="text-sm text-muted">Yetkiler kontrol ediliyor…</p>
      </PageContainer>
    )
  }

  if (!canRead) return null

  return (
    <PageContainer>
      {!isDefinitionsPage && <QuestionForm readOnly={!canEdit} />}

      {isDefinitionsPage && (
        <div className="w-full">
          <Select
            label="Anket"
            value={selectedSurveyId > 0 ? String(selectedSurveyId) : ''}
            onChange={(e) => setSelectedSurveyId(Number(e.target.value) || 0)}
            options={[{ key: 'placeholder', value: '', label: 'Anket seçin' }, ...surveySelectOptions]}
          />
        </div>
      )}

      {isDefinitionsPage && (
        <QuestionsTable
          data={currentQuestions}
          isLoading={isDefinitionsLoading}
          isError={questionsQuery.isError && Boolean(getDefinitionsError())}
          error={getDefinitionsError()}
          onRefresh={refreshQuestions}
          onEdit={canEdit ? openEditModal : undefined}
          onSetPassive={canEdit ? handleSetPassive : undefined}
          onDelete={canEdit ? handleDelete : undefined}
          isUpdating={isMutating}
          isDeleting={deleteQuestion.isPending}
        />
      )}

      <Modal
        open={Boolean(editingQuestion)}
        onClose={closeEditModal}
        title="Soruyu Düzenle"
        description="Soru metni ve temel alanları güncelleyin"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeEditModal}>
              İptal
            </Button>
            <Button
              onClick={() => void handleEditSave()}
              loading={updateQuestion.isPending || updateBagliKosul.isPending}
              disabled={!editText.trim()}
            >
              Kaydet
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Soru"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Soru metni"
            required
          />
          {editingQuestion?.bagliSoru && (
            <Select
              label={GORUNME_KOSULU_LABEL}
              value={editBagliKosulTipi}
              onChange={(e) => setEditBagliKosulTipi(e.target.value)}
              options={BAGLI_KOSUL_TIPI_OPTIONS.map((option) => ({
                key: option.value,
                value: option.value,
                label: option.label,
              }))}
            />
          )}
          {(updateQuestion.isError || updateBagliKosul.isError) && (
            <p className="text-sm text-red-600" role="alert">
              {getErrorMessage(updateQuestion.error ?? updateBagliKosul.error)}
            </p>
          )}
        </div>
      </Modal>
    </PageContainer>
  )
}
