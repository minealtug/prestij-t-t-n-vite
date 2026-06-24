import { useMemo } from 'react'
import { CheckCircle2, CircleAlert, ClipboardList, Percent } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import type { AnketCevapOzetItem } from '../types/survey-response.types'
import { computeSurveyResponseStats } from '../utils/compute-survey-response-stats'

function displayCount(value: number | undefined, loading: boolean) {
  if (loading) return '…'
  if (value === undefined) return '—'
  return value.toLocaleString('tr-TR')
}

function displayPercent(value: number | null | undefined, loading: boolean) {
  if (loading) return '…'
  if (value == null) return '—'
  return `%${value}`
}

interface SurveyResponseStatsCardsProps {
  data: AnketCevapOzetItem[]
  filterSummary?: string
  isLoading: boolean
}

export function SurveyResponseStatsCards({
  data,
  filterSummary,
  isLoading,
}: SurveyResponseStatsCardsProps) {
  const stats = useMemo(() => computeSurveyResponseStats(data), [data])

  const tamamlanmaTrend =
    stats.tamamlanmaOrani != null
      ? `${stats.tamamlananAnketSayisi} / ${stats.toplamKayitSayisi} anket tamamlandı`
      : 'Henüz anket kaydı yok'

  return (
    <section className="px-1 py-1">
      {filterSummary ? (
        <div className="mb-4 rounded-md border border-[#d4dde8] bg-[#f5f7fa] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Seçili filtre</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{filterSummary}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tamamlanan anket"
          value={displayCount(stats.tamamlananAnketSayisi, isLoading)}
          icon={CheckCircle2}
          variant="success"
          trend={tamamlanmaTrend}
          className="rounded-md !border !border-[#d4dde8] bg-[#f6faf9] !shadow-none hover:!translate-y-0 hover:!shadow-none"
          iconContainerClassName="rounded-md border border-[#c5ddd8] bg-[#e0eeeb] text-[#3d7d74]"
        />
        <StatCard
          label="Tamamlanmayan anket"
          value={displayCount(stats.tamamlanmayanAnketSayisi, isLoading)}
          icon={CircleAlert}
          variant="default"
          className="rounded-md !border !border-[#d4dde8] bg-[#faf8f9] !shadow-none hover:!translate-y-0 hover:!shadow-none"
          iconContainerClassName="rounded-md border border-[#d8cfd4] bg-[#ebe5e8] text-[#7d6570]"
        />
        <StatCard
          label="Tamamlanma oranı"
          value={displayPercent(stats.tamamlanmaOrani, isLoading)}
          icon={Percent}
          variant="warning"
          className="rounded-md !border !border-[#d4dde8] bg-[#faf9f7] !shadow-none hover:!translate-y-0 hover:!shadow-none"
          iconContainerClassName="rounded-md border border-[#d8d4cb] bg-[#ece9e2] text-[#7a7468]"
        />
        <StatCard
          label="Toplam anket kaydı"
          value={displayCount(stats.toplamKayitSayisi, isLoading)}
          icon={ClipboardList}
          variant="default"
          className="rounded-md !border !border-[#d4dde8] bg-[#f6f8fb] !shadow-none hover:!translate-y-0 hover:!shadow-none"
          iconContainerClassName="rounded-md border border-[#c8d4e0] bg-[#e5ebf2] text-[#4f6580]"
        />
      </div>
    </section>
  )
}
