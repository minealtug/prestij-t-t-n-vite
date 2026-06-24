import { useCallback, useEffect, useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CografiFiltreFields } from '@/features/cografi-filtre/components/CografiFiltreFields'
import { useCografiFiltreCascade } from '@/features/cografi-filtre/hooks/use-cografi-filtre-cascade'
import {
  useCografiFiltreOptions,
  useMintikaCografiFiltreOptions,
} from '@/features/cografi-filtre/hooks/use-cografi-filtre-options'
import {
  getAlimNoktalariForMintika,
  getBolgelerForMensei,
  getKoylerForAlimNoktasi,
  getMintikalarForBolge,
} from '@/features/cografi-filtre/utils/cografi-filtre'
import { SurveyResponseStatsCards } from '../components/SurveyResponseStatsCards'
import { SurveyResponsesTable } from '../components/SurveyResponsesTable'
import { useSurveyResponses } from '../hooks/use-survey-responses'
import { PageContainer } from '@/components/layout/PageContainer'
import { usePermissions } from '@/features/permissions/hooks/use-permissions'
import { useRequirePagePermission } from '@/features/permissions/hooks/use-require-page-permission'
import type { SurveyResponsesQueryParams } from '../types/survey-response.types'
import { hasGeoSurveyFilter } from '../types/survey-response.types'
import { formatAppliedFilterSummary } from '../utils/format-applied-filter-summary'

export function SurveyResponsesPage() {
  const { canRead, loading: pagePermissionLoading } = useRequirePagePermission()
  const { isAdmin, loading: permissionLoading } = usePermissions()
  const permissionsReady = !permissionLoading && !pagePermissionLoading

  const globalOptionsQuery = useCografiFiltreOptions(permissionsReady && isAdmin)
  const mintikaOptionsQuery = useMintikaCografiFiltreOptions(permissionsReady && !isAdmin)
  const cografiFiltreQuery = isAdmin ? globalOptionsQuery : mintikaOptionsQuery

  const geoCascade = useCografiFiltreCascade(cografiFiltreQuery.data)

  const [appliedFilters, setAppliedFilters] = useState<SurveyResponsesQueryParams | null>(null)
  const [appliedFilterSummary, setAppliedFilterSummary] = useState('')

  const filterLookups = useMemo(() => {
    const options = cografiFiltreQuery.data
    if (!options) {
      return {
        menseiler: [],
        bolgeler: [],
        mintikalar: [],
        alimNoktalari: [],
        koyler: [],
      }
    }

    const { menseiId, bolgeId, mintikaId, alimNoktasiId } = geoCascade.queryParams

    return {
      menseiler: options.menseiler,
      bolgeler: getBolgelerForMensei(options, menseiId),
      mintikalar: getMintikalarForBolge(options, bolgeId),
      alimNoktalari: getAlimNoktalariForMintika(options, mintikaId),
      koyler: getKoylerForAlimNoktasi(options, alimNoktasiId),
    }
  }, [cografiFiltreQuery.data, geoCascade.queryParams])

  const draftFiltersReady = hasGeoSurveyFilter(geoCascade.queryParams)

  const responsesQuery = useSurveyResponses(appliedFilters ?? undefined)
  const filtersReady = hasGeoSurveyFilter(appliedFilters ?? undefined)

  const applyFilters = useCallback(
    (params: SurveyResponsesQueryParams) => {
      if (!hasGeoSurveyFilter(params)) return
      setAppliedFilters(params)
      setAppliedFilterSummary(formatAppliedFilterSummary(params, filterLookups))
    },
    [filterLookups],
  )

  const handleApplyFilters = () => {
    applyFilters(geoCascade.queryParams)
  }

  useEffect(() => {
    if (!permissionsReady || isAdmin) return
    if (!draftFiltersReady) return
    applyFilters(geoCascade.queryParams)
  }, [
    permissionsReady,
    isAdmin,
    draftFiltersReady,
    applyFilters,
    geoCascade.queryParams,
  ])

  if (pagePermissionLoading || permissionLoading) {
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
        <div className="p-5">
          <CografiFiltreFields
            values={geoCascade.values}
            selectOptions={geoCascade.selectOptions}
            lockedLevels={isAdmin ? undefined : geoCascade.lockedLevels}
            disabled={cografiFiltreQuery.isLoading}
            onMenseiChange={geoCascade.setMenseiId}
            onBolgeChange={geoCascade.setBolgeId}
            onMintikaChange={geoCascade.setMintikaId}
            onAlimNoktasiChange={geoCascade.setAlimNoktasiId}
            onKoyChange={geoCascade.setKoyId}
          />
        </div>

        {isAdmin && (
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
        )}
      </Card>

      <Card className="overflow-hidden !rounded-md !p-0" interactive={false}>
        {!filtersReady ? (
          <p className="px-5 py-5 text-sm text-muted">
            {isAdmin
              ? "Listelemek için en az bir coğrafi filtre (menşei, bölge, mıntıka vb.) seçin ve Filtrele'ye tıklayın."
              : cografiFiltreQuery.isLoading
                ? 'Mıntıka filtreleri yükleniyor…'
                : 'Mıntıka bilgisi yüklenemedi veya tanımlı değil.'}
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
