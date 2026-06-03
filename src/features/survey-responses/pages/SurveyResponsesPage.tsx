import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { useAuthStore } from '@/stores/auth-store'
import { SurveyResponsesTable } from '../components/SurveyResponsesTable'
import { useEkiciler } from '../hooks/use-ekiciler'
import { useSurveyResponses } from '../hooks/use-survey-responses'
import { PageContainer } from '@/components/layout/PageContainer'
import { formatEkiciLabel } from '../types/survey-response.types'

export function SurveyResponsesPage() {
  const user = useAuthStore((s) => s.user)
  const ekicilerQuery = useEkiciler()
  const [ekiciFilter, setEkiciFilter] = useState('')
  const [search, setSearch] = useState('')

  const ekiciOptions = useMemo(() => {
    const ekiciler = ekicilerQuery.data ?? []
    return ekiciler.map((e) => ({
      key: e.id,
      value: e.id,
      label: formatEkiciLabel(e),
    }))
  }, [ekicilerQuery.data])

  const responsesQuery = useSurveyResponses({
    ekiciId: ekiciFilter || undefined,
    search: search.trim() || undefined,
  })

  const showSelectEkiciHint = !ekiciFilter

  return (
    <PageContainer>
      <div>
        <p className="text-sm text-muted">
          Ekici seçerek anket cevaplarını görüntüleyin ve filtreleyin.
        </p>
        {user?.email && (
          <p className="mt-1 text-xs text-muted">
            Oturum: <span className="font-medium text-foreground">{user.email}</span>
          </p>
        )}
      </div>

      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <SearchableSelect
              label="Ekici"
              value={ekiciFilter}
              onChange={setEkiciFilter}
              options={ekiciOptions}
              disabled={ekicilerQuery.isLoading}
              placeholder="Ekici ara veya seç..."
            />
          </div>
          <div className="flex-1">
            <label htmlFor="response-search" className="text-sm font-medium text-foreground">
              Arama
            </label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="response-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ara: ekici, anket, mıntıka, soru, cevap..."
                className="h-10 w-full rounded-lg border border-border bg-surface-elevated py-2 pr-3 pl-9 text-sm placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                disabled={!ekiciFilter}
              />
            </div>
          </div>
        </div>

        {showSelectEkiciHint ? (
          <p className="text-sm text-muted">Listelemek için yukarıdan bir ekici seçin.</p>
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
