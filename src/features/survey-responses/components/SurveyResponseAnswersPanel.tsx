import { ErrorState } from '@/components/feedback/ErrorState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { cn } from '@/lib/utils/cn'
import { useSurveyResponseDetail } from '../hooks/use-survey-response-detail'
import { UNANSWERED_ANSWER_LABEL } from '../types/survey-response.types'
import { buildSoruCevapTree, flattenSoruCevapTree } from '../utils/map-anket-cevap'

interface SurveyResponseAnswersPanelProps {
  ekiciId: string
  sablonId: number
  baslikId?: number
  kategoriAdi?: string
  enabled: boolean
}

export function SurveyResponseAnswersPanel({
  ekiciId,
  sablonId,
  baslikId,
  kategoriAdi = 'Genel',
  enabled,
}: SurveyResponseAnswersPanelProps) {
  const detailQuery = useSurveyResponseDetail(ekiciId, sablonId, enabled, baslikId)

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-2 px-3 py-2">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
      </div>
    )
  }

  if (detailQuery.isError) {
    return (
      <div className="px-3 py-2">
        <ErrorState
          error={detailQuery.error}
          title="Sorular yüklenemedi"
          onRetry={() => void detailQuery.refetch()}
          compact
        />
      </div>
    )
  }

  const detail = detailQuery.data
  if (!detail) {
    return <p className="px-3 py-2 text-xs text-muted">Gösterilecek soru yok.</p>
  }

  const rows = flattenSoruCevapTree(buildSoruCevapTree(detail.sorular), kategoriAdi)

  if (rows.length === 0) {
    return <p className="px-3 py-2 text-xs text-muted">Gösterilecek soru yok.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="app-table app-table-compact min-w-[640px]">
        <thead>
          <tr>
            <th>KATEGORİ</th>
            <th>SORU</th>
            <th>CEVAP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isUnanswered =
              !row.yanitlandi || row.cevapMetni === UNANSWERED_ANSWER_LABEL
            const cevapMetni = isUnanswered ? UNANSWERED_ANSWER_LABEL : row.cevapMetni

            return (
              <tr key={`${ekiciId}-${sablonId}-${row.soruId}`}>
                <td className="align-top">{row.kategori}</td>
                <td className="align-top font-medium">{row.soruMetni}</td>
                <td
                  className={cn(
                    'align-top',
                    isUnanswered && 'font-medium text-red-600',
                  )}
                >
                  {cevapMetni}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
