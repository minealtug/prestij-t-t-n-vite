import { useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { useAuthStore } from '@/stores/auth-store'
import { SurveyResponsesTable } from '../components/SurveyResponsesTable'
import {
  useAlimNoktalari,
  useBolgeler,
  useKoyler,
  useMenseiler,
  useMintikalar,
} from '../hooks/use-survey-response-filters'
import { useSurveyResponses } from '../hooks/use-survey-responses'
import { PageContainer } from '@/components/layout/PageContainer'
import type { FilterOptionDto, SurveyResponsesQueryParams } from '../types/survey-response.types'
import { hasAnySurveyFilter } from '../types/survey-response.types'

function toSelectOptions(
  items: FilterOptionDto[],
  placeholder: string,
): { value: string; label: string }[] {
  const options = [{ value: '', label: placeholder }]
  items.forEach((item) => options.push({ value: String(item.id), label: item.adi }))
  return options
}

export function SurveyResponsesPage() {
  const user = useAuthStore((s) => s.user)
  const [menseiId, setMenseiId] = useState('')
  const [bolgeId, setBolgeId] = useState('')
  const [mintikaId, setMintikaId] = useState('')
  const [alimNoktasiId, setAlimNoktasiId] = useState('')
  const [koyId, setKoyId] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<SurveyResponsesQueryParams | null>(null)

  const menseiIdNum = menseiId ? Number(menseiId) : undefined
  const bolgeIdNum = bolgeId ? Number(bolgeId) : undefined
  const mintikaIdNum = mintikaId ? Number(mintikaId) : undefined
  const alimNoktasiIdNum = alimNoktasiId ? Number(alimNoktasiId) : undefined
  const koyIdNum = koyId ? Number(koyId) : undefined

  const draftFilterParams = useMemo(
    () => ({
      menseiId: menseiIdNum,
      bolgeId: bolgeIdNum,
      mintikaId: mintikaIdNum,
      alimNoktasiId: alimNoktasiIdNum,
      koyId: koyIdNum,
    }),
    [menseiIdNum, bolgeIdNum, mintikaIdNum, alimNoktasiIdNum, koyIdNum],
  )

  const draftFiltersReady = hasAnySurveyFilter(draftFilterParams)

  const menseilerQuery = useMenseiler()
  const bolgelerQuery = useBolgeler(menseiIdNum)
  const mintikalarQuery = useMintikalar(bolgeIdNum)
  const alimNoktalariQuery = useAlimNoktalari(mintikaIdNum)
  const koylerQuery = useKoyler(alimNoktasiIdNum)

  const responsesQuery = useSurveyResponses(appliedFilters ?? undefined)
  const filtersReady = hasAnySurveyFilter(appliedFilters ?? undefined)

  const handleApplyFilters = () => {
    if (!draftFiltersReady) return
    setAppliedFilters(draftFilterParams)
  }

  const menseiOptions = useMemo(
    () => toSelectOptions(menseilerQuery.data ?? [], 'Menşei seçin'),
    [menseilerQuery.data],
  )
  const bolgeOptions = useMemo(
    () => toSelectOptions(bolgelerQuery.data ?? [], 'Bölge seçin'),
    [bolgelerQuery.data],
  )
  const mintikaOptions = useMemo(
    () => toSelectOptions(mintikalarQuery.data ?? [], 'Mıntıka seçin'),
    [mintikalarQuery.data],
  )
  const alimNoktasiOptions = useMemo(
    () => toSelectOptions(alimNoktalariQuery.data ?? [], 'Alım noktası seçin'),
    [alimNoktalariQuery.data],
  )
  const koyOptions = useMemo(
    () => toSelectOptions(koylerQuery.data ?? [], 'Köy seçin'),
    [koylerQuery.data],
  )

  return (
    <PageContainer>
      <div>
        {user?.email && (
          <p className="mt-1 text-xs text-muted">
            Oturum: <span className="font-medium text-foreground">{user.email}</span>
          </p>
        )}
      </div>

      <Card className="overflow-hidden !p-0" interactive={false}>
        <div className="grid w-full grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Select
            label="Menşei"
            value={menseiId}
            onChange={(e) => setMenseiId(e.target.value)}
            options={menseiOptions}
            disabled={menseilerQuery.isLoading}
          />
          <Select
            label="Bölge"
            value={bolgeId}
            onChange={(e) => setBolgeId(e.target.value)}
            options={bolgeOptions}
            disabled={bolgelerQuery.isLoading}
          />
          <Select
            label="Mıntıka"
            value={mintikaId}
            onChange={(e) => setMintikaId(e.target.value)}
            options={mintikaOptions}
            disabled={mintikalarQuery.isLoading}
          />
          <Select
            label="Alım noktası"
            value={alimNoktasiId}
            onChange={(e) => setAlimNoktasiId(e.target.value)}
            options={alimNoktasiOptions}
            disabled={alimNoktalariQuery.isLoading}
          />
          <Select
            label="Köy"
            value={koyId}
            onChange={(e) => setKoyId(e.target.value)}
            options={koyOptions}
            disabled={koylerQuery.isLoading}
          />
        </div>

        <div className="flex justify-end border-t border-border px-5 py-4">
          <Button
            onClick={handleApplyFilters}
            disabled={!draftFiltersReady}
            loading={responsesQuery.isFetching && filtersReady}
          >
            <Filter className="h-4 w-4" />
            Filtrele
          </Button>
        </div>

        {!filtersReady ? (
          <p className="px-5 pb-5 text-sm text-muted">
            Listelemek için en az bir filtre seçin ve Filtrele&apos;ye tıklayın.
          </p>
        ) : (
          <SurveyResponsesTable
            data={responsesQuery.data ?? []}
            isLoading={responsesQuery.isLoading}
            isError={responsesQuery.isError}
            error={responsesQuery.error}
            onRefresh={() => void responsesQuery.refetch()}
          />
        )}
      </Card>
    </PageContainer>
  )
}
