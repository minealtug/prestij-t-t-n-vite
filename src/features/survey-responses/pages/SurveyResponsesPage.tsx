import { useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { SurveyResponseStatsCards } from '../components/SurveyResponseStatsCards'
import { SurveyResponsesTable } from '../components/SurveyResponsesTable'
import { useCografiFiltreOptions } from '../hooks/use-survey-response-filters'
import {
  getAlimNoktalariForMintika,
  getBolgelerForMensei,
  getKoylerForAlimNoktasi,
  getMintikalarForBolge,
} from '../utils/cografi-filtre'
import { useSurveyResponses } from '../hooks/use-survey-responses'
import { PageContainer } from '@/components/layout/PageContainer'
import { useRequirePagePermission } from '@/features/permissions/hooks/use-require-page-permission'
import type { FilterOptionDto, SurveyResponsesQueryParams } from '../types/survey-response.types'
import { hasGeoSurveyFilter } from '../types/survey-response.types'
import { formatAppliedFilterSummary } from '../utils/format-applied-filter-summary'

function toSelectOptions(
  items: FilterOptionDto[],
  placeholder: string,
): { value: string; label: string }[] {
  const options = [{ value: '', label: placeholder }]
  items.forEach((item) => options.push({ value: String(item.id), label: item.adi }))
  return options
}

export function SurveyResponsesPage() {
  const { canRead, loading: permissionLoading } = useRequirePagePermission()
  const [menseiId, setMenseiId] = useState('')
  const [bolgeId, setBolgeId] = useState('')
  const [mintikaId, setMintikaId] = useState('')
  const [alimNoktasiId, setAlimNoktasiId] = useState('')
  const [koyId, setKoyId] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<SurveyResponsesQueryParams | null>(null)
  const [appliedFilterSummary, setAppliedFilterSummary] = useState('')

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

  const draftFiltersReady = hasGeoSurveyFilter(draftFilterParams)

  const cografiFiltreQuery = useCografiFiltreOptions()
  const cografiFiltre = cografiFiltreQuery.data

  const menseiler = cografiFiltre?.menseiler ?? []
  const bolgeler = useMemo(
    () => (cografiFiltre ? getBolgelerForMensei(cografiFiltre, menseiIdNum) : []),
    [cografiFiltre, menseiIdNum],
  )
  const mintikalar = useMemo(
    () => (cografiFiltre ? getMintikalarForBolge(cografiFiltre, bolgeIdNum) : []),
    [cografiFiltre, bolgeIdNum],
  )
  const alimNoktalari = useMemo(
    () => (cografiFiltre ? getAlimNoktalariForMintika(cografiFiltre, mintikaIdNum) : []),
    [cografiFiltre, mintikaIdNum],
  )
  const koyler = useMemo(
    () => (cografiFiltre ? getKoylerForAlimNoktasi(cografiFiltre, alimNoktasiIdNum) : []),
    [cografiFiltre, alimNoktasiIdNum],
  )

  const responsesQuery = useSurveyResponses(appliedFilters ?? undefined)
  const filtersReady = hasGeoSurveyFilter(appliedFilters ?? undefined)

  const handleApplyFilters = () => {
    if (!draftFiltersReady) return
    setAppliedFilters(draftFilterParams)
    setAppliedFilterSummary(
      formatAppliedFilterSummary(draftFilterParams, {
        menseiler,
        bolgeler,
        mintikalar,
        alimNoktalari,
        koyler,
      }),
    )
  }

  const menseiOptions = useMemo(
    () => toSelectOptions(menseiler, 'Menşei seçin'),
    [menseiler],
  )
  const bolgeOptions = useMemo(
    () => toSelectOptions(bolgeler, 'Bölge seçin'),
    [bolgeler],
  )
  const mintikaOptions = useMemo(
    () => toSelectOptions(mintikalar, 'Mıntıka seçin'),
    [mintikalar],
  )
  const alimNoktasiOptions = useMemo(
    () => toSelectOptions(alimNoktalari, 'Alım noktası seçin'),
    [alimNoktalari],
  )
  const koyOptions = useMemo(
    () => toSelectOptions(koyler, 'Köy seçin'),
    [koyler],
  )

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
      {filtersReady && (
        <SurveyResponseStatsCards
          data={responsesQuery.data ?? []}
          filterSummary={appliedFilterSummary}
          isLoading={responsesQuery.isLoading}
        />
      )}

      <Card className="overflow-hidden !rounded-md !p-0" interactive={false}>
        <div className="grid w-full grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Select
            label="Menşei"
            value={menseiId}
            onChange={(e) => setMenseiId(e.target.value)}
            options={menseiOptions}
            disabled={cografiFiltreQuery.isLoading}
          />
          <Select
            label="Bölge"
            value={bolgeId}
            onChange={(e) => setBolgeId(e.target.value)}
            options={bolgeOptions}
            disabled={cografiFiltreQuery.isLoading}
          />
          <Select
            label="Mıntıka"
            value={mintikaId}
            onChange={(e) => setMintikaId(e.target.value)}
            options={mintikaOptions}
            disabled={cografiFiltreQuery.isLoading}
          />
          <Select
            label="Alım noktası"
            value={alimNoktasiId}
            onChange={(e) => setAlimNoktasiId(e.target.value)}
            options={alimNoktasiOptions}
            disabled={cografiFiltreQuery.isLoading}
          />
          <Select
            label="Köy"
            value={koyId}
            onChange={(e) => setKoyId(e.target.value)}
            options={koyOptions}
            disabled={cografiFiltreQuery.isLoading}
          />
        </div>

        <div className="flex justify-end border-t border-[#ececec] px-4 py-3">
          <Button
            onClick={handleApplyFilters}
            disabled={!draftFiltersReady}
            loading={responsesQuery.isFetching && filtersReady}
          >
            <Filter className="h-4 w-4" />
            Filtrele
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden !rounded-md !p-0" interactive={false}>
        {!filtersReady ? (
          <p className="px-5 py-5 text-sm text-muted">
            Listelemek için en az bir coğrafi filtre (menşei, bölge, mıntıka vb.) seçin ve
            Filtrele&apos;ye tıklayın.
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
