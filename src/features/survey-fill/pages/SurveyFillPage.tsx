import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { PageContainer } from '@/components/layout/PageContainer'
import { useRequirePagePermission } from '@/features/permissions/hooks/use-require-page-permission'
import { useSurveys } from '@/features/surveys/hooks/use-surveys'
import { SurveyFillForm } from '../components/SurveyFillForm'
import { useAnketSablonlar } from '../hooks/use-anket-yanit'

export function SurveyFillPage() {
  const { canRead, canEdit, loading: permissionLoading } = useRequirePagePermission()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedBaslikId, setSelectedBaslikId] = useState(0)
  const [selectedSablonId, setSelectedSablonId] = useState(0)
  const [initialEkiciId, setInitialEkiciId] = useState<string | null>(null)

  const surveysQuery = useSurveys()
  const sablonlarQuery = useAnketSablonlar(selectedBaslikId > 0 ? selectedBaslikId : null)

  useEffect(() => {
    const baslikId = Number(searchParams.get('baslikId'))
    const sablonId = Number(searchParams.get('sablonId'))
    const ekiciId = searchParams.get('ekiciId')?.trim() || null

    if (!Number.isFinite(baslikId) || baslikId <= 0) return
    if (!Number.isFinite(sablonId) || sablonId <= 0) return
    if (!ekiciId) return

    setSelectedBaslikId(baslikId)
    setSelectedSablonId(sablonId)
    setInitialEkiciId(ekiciId)
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (selectedBaslikId > 0) return
    const surveys = surveysQuery.data
    if (!surveys?.length) return
    setSelectedBaslikId(Number(surveys[0].id))
  }, [surveysQuery.data, selectedBaslikId])

  useEffect(() => {
    if (selectedBaslikId <= 0) {
      setSelectedSablonId(0)
      return
    }

    const sablonlar = sablonlarQuery.data ?? []
    if (sablonlar.length === 0) {
      setSelectedSablonId(0)
      return
    }

    const currentSablonValid = sablonlar.some((sablon) => sablon.id === selectedSablonId)
    if (!currentSablonValid) {
      setSelectedSablonId(sablonlar[0].id)
    }
  }, [selectedBaslikId, sablonlarQuery.data, selectedSablonId])

  const selectedSurvey = useMemo(
    () => (surveysQuery.data ?? []).find((survey) => Number(survey.id) === selectedBaslikId),
    [surveysQuery.data, selectedBaslikId],
  )

  const selectedSablon = useMemo(
    () => (sablonlarQuery.data ?? []).find((sablon) => sablon.id === selectedSablonId),
    [sablonlarQuery.data, selectedSablonId],
  )

  const surveyOptions = useMemo(
    () => [
      {
        key: 'placeholder',
        value: '',
        label: surveysQuery.isLoading ? 'Anketler yükleniyor...' : 'Anket seçin',
      },
      ...(surveysQuery.data ?? []).map((survey) => ({
        key: String(survey.id),
        value: String(survey.id),
        label: survey.name,
      })),
    ],
    [surveysQuery.data, surveysQuery.isLoading],
  )

  const sessionReady = selectedBaslikId > 0
  const selectDisabled =
    surveysQuery.isLoading && (surveysQuery.data?.length ?? 0) === 0

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
      <Card className="overflow-hidden !p-0" interactive={false}>
        <div className="grid gap-4 p-5">
          <Select
            label="Anket"
            value={selectedBaslikId > 0 ? String(selectedBaslikId) : ''}
            onChange={(e) => {
              setSelectedBaslikId(Number(e.target.value) || 0)
              setSelectedSablonId(0)
              setInitialEkiciId(null)
            }}
            options={surveyOptions}
            disabled={selectDisabled}
            required
          />
        </div>

        {sessionReady ? (
          <SurveyFillForm
            baslikId={selectedBaslikId}
            sablonId={selectedSablonId}
            baslikAdi={selectedSurvey?.name}
            sablonAdi={selectedSablon?.adi}
            initialEkiciId={initialEkiciId}
            canSubmit={canEdit && selectedSablonId > 0}
            onRefreshSablonlar={() => void sablonlarQuery.refetch()}
          />
        ) : (
          <div className="border-t border-border px-5 py-8 text-sm text-muted">
            {selectDisabled ? 'Anketler yükleniyor…' : 'Soruları görmek için anket seçin.'}
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
