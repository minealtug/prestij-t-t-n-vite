import { useState } from 'react'
import { ClipboardList, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { getErrorMessage } from '@/lib/api/api-error'
import { QuestionForm } from '../components/QuestionForm'
import { QuestionsTable } from '../components/QuestionsTable'
import { useQuestions, useUpdateQuestion } from '../hooks/use-questions'
import { useCreateSurvey } from '@/features/surveys/hooks/use-surveys'
import { CATEGORY_OPTIONS } from '../constants'
import { PageContainer } from '@/components/layout/PageContainer'
import type { AnswerType, QuestionDto } from '../types/question.types'

export function QuestionsPage() {
  const questionsQuery = useQuestions()
  const createSurvey = useCreateSurvey()
  const updateQuestion = useUpdateQuestion()
  const [surveyModalOpen, setSurveyModalOpen] = useState(false)
  const [surveyName, setSurveyName] = useState('')
  const [surveyCategory, setSurveyCategory] = useState('Genel')
  const [editingQuestion, setEditingQuestion] = useState<QuestionDto | null>(null)
  const [editText, setEditText] = useState('')
  const [editCategory, setEditCategory] = useState('Genel')
  const [editAnswerType, setEditAnswerType] = useState<AnswerType>('long_text')

  const handleCreateSurvey = () => {
    createSurvey.mutate(
      { name: surveyName, category: surveyCategory },
      {
        onSuccess: () => {
          setSurveyModalOpen(false)
          setSurveyName('')
          setSurveyCategory('Genel')
        },
      },
    )
  }

  const openEditModal = (question: QuestionDto) => {
    setEditingQuestion(question)
    setEditText(question.questionText)
    setEditCategory(question.category)
    setEditAnswerType(question.answerType)
  }

  const closeEditModal = () => {
    setEditingQuestion(null)
    setEditText('')
    setEditCategory('Genel')
    setEditAnswerType('long_text')
  }

  const handleEditSave = () => {
    if (!editingQuestion || !editText.trim()) return
    updateQuestion.mutate(
      {
        id: editingQuestion.id,
        payload: {
          questionText: editText.trim(),
          category: editCategory,
          answerType: editAnswerType,
          order: editingQuestion.questionNo,
          isActive: editingQuestion.isActive,
          surveyName: editingQuestion.surveyName,
          saveAsDraft: false,
        },
      },
      {
        onSuccess: () => closeEditModal(),
      },
    )
  }

  const handleSetPassive = (question: QuestionDto) => {
    if (!question.isActive) return
    if (!window.confirm('Bu soruyu pasife almak istediğinize emin misiniz?')) return
    updateQuestion.mutate({
      id: question.id,
      payload: { isActive: false },
    })
  }

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Soru Yönetimi</h2>
          <p className="text-sm text-muted">Anket sorularını oluşturun ve yönetin</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setSurveyModalOpen(true)}>
            <ClipboardList className="h-4 w-4" />
            Yeni Anket Ekle
          </Button>
        </div>
      </div>

      <QuestionForm />

      <Card>
        <QuestionsTable
          data={questionsQuery.data ?? []}
          isLoading={questionsQuery.isLoading}
          isError={questionsQuery.isError}
          error={questionsQuery.error}
          onRefresh={() => void questionsQuery.refetch()}
          onEdit={openEditModal}
          onSetPassive={handleSetPassive}
          isUpdating={updateQuestion.isPending}
        />
      </Card>

      <Modal
        open={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        title="Yeni Anket Ekle"
        description="POST /api/surveys — .NET API ile kaydedilir"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSurveyModalOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleCreateSurvey}
              loading={createSurvey.isPending}
              disabled={!surveyName.trim()}
            >
              <Plus className="h-4 w-4" />
              Kaydet
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Anket İsmi"
            value={surveyName}
            onChange={(e) => setSurveyName(e.target.value)}
            placeholder="Anket adı"
            required
          />
          <Select
            label="Kategori"
            value={surveyCategory}
            onChange={(e) => setSurveyCategory(e.target.value)}
            options={CATEGORY_OPTIONS}
          />
          {createSurvey.isError && (
            <p className="text-sm text-red-600" role="alert">
              {getErrorMessage(createSurvey.error)}
            </p>
          )}
        </div>
      </Modal>

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
              onClick={handleEditSave}
              loading={updateQuestion.isPending}
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
          <Select
            label="Kategori"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            options={CATEGORY_OPTIONS}
          />
          <Select
            label="Cevap Tipi"
            value={editAnswerType}
            onChange={(e) => setEditAnswerType(e.target.value as AnswerType)}
            options={[
              { value: 'long_text', label: 'Uzun Metin' },
              { value: 'short_text', label: 'Kısa Metin' },
              { value: 'single_choice', label: 'Tek Seçim' },
              { value: 'multiple_choice', label: 'Çoklu Seçim' },
              { value: 'number', label: 'Sayı' },
              { value: 'date', label: 'Tarih' },
            ]}
          />
          {updateQuestion.isError && (
            <p className="text-sm text-red-600" role="alert">
              {getErrorMessage(updateQuestion.error)}
            </p>
          )}
        </div>
      </Modal>
    </PageContainer>
  )
}
