import { useMemo, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { getErrorMessage } from '@/lib/api/api-error'
import { PageContainer } from '@/components/layout/PageContainer'
import { useRequirePagePermission } from '@/features/permissions/hooks/use-require-page-permission'
import { AnswerUnitsTable } from '../components/AnswerUnitsTable'
import {
  useAnswerUnits,
  useCreateAnswerUnit,
  useDeleteAnswerUnit,
  useUpdateAnswerUnit,
} from '../hooks/use-answer-units'
import type { AnswerUnitDto } from '../types/answer-unit.types'
import {
  DUPLICATE_ANSWER_UNIT_NAME_MESSAGE,
  isAnswerUnitNameTaken,
} from '../utils/answer-unit-name'

export function AnswerUnitsPage() {
  const { canRead, canEdit, loading: permissionLoading } = useRequirePagePermission()
  const unitsQuery = useAnswerUnits()
  const createUnit = useCreateAnswerUnit()
  const updateUnit = useUpdateAnswerUnit()
  const deleteUnit = useDeleteAnswerUnit()

  const [unitName, setUnitName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [updateError, setUpdateError] = useState('')

  const units = unitsQuery.data ?? []
  const trimmedName = unitName.trim()
  const trimmedEditName = editName.trim()

  const isDuplicateCreateName = useMemo(
    () => isAnswerUnitNameTaken(trimmedName, units),
    [trimmedName, units],
  )

  const isDuplicateEditName = useMemo(
    () =>
      editingId != null
        ? isAnswerUnitNameTaken(trimmedEditName, units, editingId)
        : false,
    [trimmedEditName, units, editingId],
  )

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!canEdit || !trimmedName || isDuplicateCreateName) return

    createUnit.mutate({ adi: trimmedName }, {
      onSuccess: () => setUnitName(''),
    })
  }

  const startEdit = (unit: AnswerUnitDto) => {
    if (!canEdit) return
    setEditingId(unit.id)
    setEditName(unit.adi)
    setUpdateError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setUpdateError('')
  }

  const saveEdit = () => {
    if (!canEdit || editingId == null || !trimmedEditName || isDuplicateEditName) return

    updateUnit.mutate(
      { id: editingId, payload: { adi: trimmedEditName } },
      {
        onSuccess: () => cancelEdit(),
        onError: (error) => setUpdateError(getErrorMessage(error)),
      },
    )
  }

  const handleDelete = (id: number) => {
    if (!canEdit) return
    if (!window.confirm('Bu birimi silmek istediğinize emin misiniz?')) return
    deleteUnit.mutate(id, {
      onSuccess: () => {
        if (editingId === id) cancelEdit()
      },
    })
  }

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
      <div className="space-y-6">
        <Card className="border-primary-500/15">
          <form onSubmit={handleCreate}>
            <div className="mb-5 flex items-start gap-3 border-b border-border pb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Yeni Birim</h3>
                <p className="mt-0.5 text-xs text-muted">
                  Anket cevaplarında kullanılacak ölçü birimlerini tanımlayın (kg, ml, adet vb.)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Birim Adı"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Örn: kg"
                required
              />

              {isDuplicateCreateName && (
                <p
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                  role="alert"
                >
                  {DUPLICATE_ANSWER_UNIT_NAME_MESSAGE}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                loading={createUnit.isPending}
                disabled={!canEdit || !trimmedName || isDuplicateCreateName}
              >
                <Plus className="h-4 w-4" />
                Birim Ekle
              </Button>

              {createUnit.isError && (
                <p
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  role="alert"
                >
                  {getErrorMessage(createUnit.error)}
                </p>
              )}
            </div>
          </form>
        </Card>

        {updateError && (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {updateError}
          </p>
        )}

        {isDuplicateEditName && editingId != null && (
          <p
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            role="alert"
          >
            {DUPLICATE_ANSWER_UNIT_NAME_MESSAGE}
          </p>
        )}

        <AnswerUnitsTable
          data={units}
          isLoading={unitsQuery.isLoading}
          isError={unitsQuery.isError}
          error={unitsQuery.error}
          onRefresh={() => void unitsQuery.refetch()}
          editingId={editingId}
          editName={editName}
          onEditNameChange={setEditName}
          onStartEdit={canEdit ? startEdit : undefined}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onDelete={canEdit ? handleDelete : undefined}
          isUpdating={updateUnit.isPending}
          isDeleting={deleteUnit.isPending}
        />
      </div>
    </PageContainer>
  )
}
