import { Pencil, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Table, type TableColumn } from '@/components/ui/Table'
import { ErrorState } from '@/components/feedback/ErrorState'
import type { EkiciDefinitionDto } from '../types/ekici-definition.types'
import { getEkiciFullName } from '../utils/normalize-ekici-definition-api'

interface EkiciDefinitionsTableProps {
  data: EkiciDefinitionDto[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRefresh: () => void
  onEdit?: (ekici: EkiciDefinitionDto) => void
}

function renderLocationLabel(value: string | null | undefined, fallbackId?: number) {
  if (value?.trim()) return value.trim()
  if (fallbackId != null && fallbackId > 0) return `#${fallbackId}`
  return '—'
}

export function EkiciDefinitionsTable({
  data,
  isLoading,
  isError,
  error,
  onRefresh,
  onEdit,
}: EkiciDefinitionsTableProps) {
  const columns: TableColumn<EkiciDefinitionDto>[] = [
    {
      key: 'ad',
      header: 'EKİCİ',
      className: 'min-w-[220px]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-foreground">{getEkiciFullName(row)}</div>
            <div className="text-xs text-muted">{row.tcKimlikNo || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'yil',
      header: 'YIL',
      className: 'w-20',
      render: (row) => row.yil || '—',
    },
    {
      key: 'menseiAdi',
      header: 'MENŞEİ',
      className: 'min-w-[120px]',
      render: (row) => renderLocationLabel(row.menseiAdi, row.menseiId),
    },
    {
      key: 'bolgeAdi',
      header: 'BÖLGE',
      className: 'min-w-[120px]',
      render: (row) => renderLocationLabel(row.bolgeAdi, row.bolgeId),
    },
    {
      key: 'mintikaAdi',
      header: 'MINTIKA',
      className: 'min-w-[120px]',
      render: (row) => renderLocationLabel(row.mintikaAdi, row.mintikaId),
    },
    {
      key: 'alimNoktasiAdi',
      header: 'ALIM NOKTASI',
      className: 'min-w-[140px]',
      render: (row) => renderLocationLabel(row.alimNoktasiAdi, row.alimNoktasiId),
    },
    {
      key: 'koyAdi',
      header: 'KÖY',
      className: 'min-w-[120px]',
      render: (row) => renderLocationLabel(row.koyAdi, row.koyId),
    },
    {
      key: 'aktif',
      header: 'AKTİF',
      className: 'w-20',
      render: (row) => (
        <span className={row.aktif === 1 ? 'font-medium text-primary-600' : 'text-muted'}>
          {row.aktif === 1 ? 'Evet' : 'Hayır'}
        </span>
      ),
    },
    ...(onEdit
      ? [
          {
            key: 'actions',
            header: 'İŞLEMLER',
            className: 'w-24',
            render: (row: EkiciDefinitionDto) =>
              row.kaynak === 'AppDb' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="!h-7 !w-7 !p-0"
                  aria-label="Düzenle"
                  onClick={() => onEdit(row)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <span className="text-xs text-muted">Salt okunur</span>
              ),
          },
        ]
      : []),
  ]

  if (isError) {
    return <ErrorState error={error} title="Ekiciler yüklenemedi" onRetry={onRefresh} compact />
  }

  return (
    <Table
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="Henüz ekici kaydı bulunmuyor."
      keyExtractor={(row) => row.id}
      pagination={{ pageSize: 20, pageSizeOptions: [20, 50, 100] }}
    />
  )
}
