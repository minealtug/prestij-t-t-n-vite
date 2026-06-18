import { Check, Pencil, Ruler, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, type TableColumn } from '@/components/ui/Table'
import { ErrorState } from '@/components/feedback/ErrorState'
import type { AnswerUnitDto } from '../types/answer-unit.types'

interface AnswerUnitsTableProps {
  data: AnswerUnitDto[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRefresh: () => void
  editingId?: number | null
  editName?: string
  onEditNameChange?: (value: string) => void
  onStartEdit?: (unit: AnswerUnitDto) => void
  onCancelEdit?: () => void
  onSaveEdit?: () => void
  onDelete?: (id: number) => void
  isUpdating?: boolean
  isDeleting?: boolean
}

export function AnswerUnitsTable({
  data,
  isLoading,
  isError,
  error,
  onRefresh,
  editingId = null,
  editName = '',
  onEditNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: AnswerUnitsTableProps) {
  const columns: TableColumn<AnswerUnitDto>[] = [
    {
      key: 'adi',
      header: 'BİRİM',
      render: (row) => {
        const isEditing = editingId === row.id

        if (isEditing) {
          return (
            <Input
              value={editName}
              onChange={(e) => onEditNameChange?.(e.target.value)}
              aria-label="Birim adı"
              autoFocus
            />
          )
        }

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
              <Ruler className="h-4 w-4" />
            </div>
            <span className="font-medium text-foreground">{row.adi}</span>
          </div>
        )
      },
    },
    ...(onStartEdit || onDelete
      ? [
          {
            key: 'actions',
            header: 'İŞLEMLER',
            className: 'w-36 text-right',
            render: (row: AnswerUnitDto) => {
              const isEditing = editingId === row.id

              if (isEditing) {
                return (
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Kaydet"
                      disabled={isUpdating || !editName.trim()}
                      onClick={onSaveEdit}
                    >
                      <Check className="h-4 w-4 text-primary-600" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="İptal"
                      disabled={isUpdating}
                      onClick={onCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              }

              return (
                <div className="flex justify-end gap-1">
                  {onStartEdit && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Düzenle"
                      disabled={isUpdating || isDeleting || editingId != null}
                      onClick={() => onStartEdit(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Sil"
                      disabled={isDeleting || editingId != null}
                      onClick={() => onDelete(row.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              )
            },
          } satisfies TableColumn<AnswerUnitDto>,
        ]
      : []),
  ]

  return (
    <div className="app-table-shell">
      {isError ? (
        <div className="p-4">
          <ErrorState
            error={error}
            title="Birimler yüklenemedi"
            onRetry={onRefresh}
            compact
          />
        </div>
      ) : (
        <Table
          columns={columns}
          data={data}
          keyExtractor={(row) => String(row.id)}
          isLoading={isLoading}
          emptyMessage="Henüz birim tanımı yok. Soldan yeni birim ekleyebilirsiniz."
          variant="plain"
          className="!rounded-none !border-0 bg-white"
        />
      )}
    </div>
  )
}
