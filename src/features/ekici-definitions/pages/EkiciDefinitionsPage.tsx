import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { getErrorMessage } from '@/lib/api/api-error'
import { PageContainer } from '@/components/layout/PageContainer'
import { useRequirePagePermission } from '@/features/permissions/hooks/use-require-page-permission'
import { EkiciDefinitionForm } from '../components/EkiciDefinitionForm'
import { EkiciDefinitionsTable } from '../components/EkiciDefinitionsTable'
import {
  useCreateEkiciDefinition,
  useEkiciDefinitions,
  useUpdateEkiciDefinition,
} from '../hooks/use-ekici-definitions'
import type { EkiciDefinitionDto } from '../types/ekici-definition.types'
import {
  createEmptyEkiciFormValues,
  ekiciDefinitionToFormValues,
  getEkiciFullName,
} from '../utils/normalize-ekici-definition-api'

function isFormValid(values: ReturnType<typeof createEmptyEkiciFormValues>) {
  return (
    values.tcKimlikNo.trim().length > 0 &&
    values.ad.trim().length > 0 &&
    values.soyad.trim().length > 0 &&
    values.babaAdi.trim().length > 0 &&
    values.makineKodu.trim().length > 0 &&
    values.dogumTarihi.trim().length > 0 &&
    values.mintikaId > 0 &&
    values.bolgeId > 0 &&
    values.menseiId > 0 &&
    values.alimNoktasiId > 0 &&
    values.koyId > 0 &&
    values.uretimMerkeziId > 0
  )
}

export function EkiciDefinitionsPage() {
  const { canRead, canEdit, loading: permissionLoading } = useRequirePagePermission()
  const ekicilerQuery = useEkiciDefinitions()
  const createEkici = useCreateEkiciDefinition()
  const updateEkici = useUpdateEkiciDefinition()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createValues, setCreateValues] = useState(createEmptyEkiciFormValues)
  const [createError, setCreateError] = useState('')

  const [editingEkici, setEditingEkici] = useState<EkiciDefinitionDto | null>(null)
  const [editValues, setEditValues] = useState(createEmptyEkiciFormValues)
  const [editError, setEditError] = useState('')

  const openCreateModal = () => {
    if (!canEdit) return
    setCreateValues(createEmptyEkiciFormValues())
    setCreateError('')
    setCreateModalOpen(true)
  }

  const closeCreateModal = () => {
    setCreateModalOpen(false)
    setCreateError('')
  }

  const handleCreate = () => {
    if (!canEdit || !isFormValid(createValues)) return

    setCreateError('')
    createEkici.mutate(createValues, {
      onSuccess: () => closeCreateModal(),
      onError: (error) => setCreateError(getErrorMessage(error)),
    })
  }

  const openEdit = (ekici: EkiciDefinitionDto) => {
    if (!canEdit || ekici.kaynak !== 'AppDb') return
    setEditingEkici(ekici)
    setEditValues(ekiciDefinitionToFormValues(ekici))
    setEditError('')
  }

  const closeEdit = () => {
    setEditingEkici(null)
    setEditError('')
  }

  const handleUpdate = () => {
    if (!canEdit || !editingEkici || !isFormValid(editValues)) return

    setEditError('')
    updateEkici.mutate(
      { id: editingEkici.id, payload: editValues },
      {
        onSuccess: () => closeEdit(),
        onError: (error) => setEditError(getErrorMessage(error)),
      },
    )
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
      <div className="space-y-4">
        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4" />
              Yeni Ekici
            </Button>
          </div>
        )}

        <EkiciDefinitionsTable
          data={ekicilerQuery.data ?? []}
          isLoading={ekicilerQuery.isLoading}
          isError={ekicilerQuery.isError}
          error={ekicilerQuery.error}
          onRefresh={() => void ekicilerQuery.refetch()}
          onEdit={canEdit ? openEdit : undefined}
        />
      </div>

      <Modal
        open={createModalOpen}
        onClose={closeCreateModal}
        title="Yeni Ekici"
        description="Yeni ekici kayıtları yalnızca uygulama veritabanına kaydedilir."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeCreateModal}>
              İptal
            </Button>
            <Button
              onClick={handleCreate}
              loading={createEkici.isPending}
              disabled={!isFormValid(createValues)}
            >
              <Plus className="h-4 w-4" />
              Ekici Ekle
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <EkiciDefinitionForm
            values={createValues}
            onChange={setCreateValues}
            disabled={createEkici.isPending}
            idPrefix="create-ekici"
          />
          {(createEkici.isError || createError) && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {createError || getErrorMessage(createEkici.error)}
            </p>
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(editingEkici)}
        onClose={closeEdit}
        title={editingEkici ? `${getEkiciFullName(editingEkici)} — Düzenle` : 'Ekici Düzenle'}
        description="Yalnızca uygulama veritabanındaki ekici kayıtları güncellenebilir."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeEdit}>
              İptal
            </Button>
            <Button
              onClick={handleUpdate}
              loading={updateEkici.isPending}
              disabled={!isFormValid(editValues)}
            >
              Kaydet
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <EkiciDefinitionForm
            values={editValues}
            onChange={setEditValues}
            disabled={updateEkici.isPending}
            idPrefix="edit-ekici"
          />
          {(updateEkici.isError || editError) && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {editError || getErrorMessage(updateEkici.error)}
            </p>
          )}
        </div>
      </Modal>
    </PageContainer>
  )
}
