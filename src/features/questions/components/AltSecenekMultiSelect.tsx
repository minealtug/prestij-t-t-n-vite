import { useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { useAltSeceneklerByGrupId } from '../hooks/use-alt-secenekler-by-grup'
import {
  GOSTERILECEK_SECENEKLER_LABEL,
  GOSTERILECEK_SECENEKLER_LOADING,
  GOSTERILECEK_SECENEKLER_NEED_GRUP,
  GOSTERILECEK_SECENEKLER_EMPTY,
} from '../utils/question-field-labels'

interface AltSecenekMultiSelectProps {
  secenekGrupId?: number
  value: number[]
  onChange: (value: number[]) => void
  label?: string
  required?: boolean
  disabled?: boolean
  id?: string
}

export function AltSecenekMultiSelect({
  secenekGrupId,
  value,
  onChange,
  label = GOSTERILECEK_SECENEKLER_LABEL,
  required = false,
  disabled = false,
  id,
}: AltSecenekMultiSelectProps) {
  const parsedGrupId =
    Number.isFinite(secenekGrupId) && (secenekGrupId ?? 0) > 0 ? secenekGrupId : undefined
  const query = useAltSeceneklerByGrupId(parsedGrupId)

  const items = useMemo(() => {
    if (!parsedGrupId) return []
    return [...(query.data ?? [])]
      .filter((item) => Number(item.secenekGrupId) === parsedGrupId)
      .sort((left, right) => {
        if (left.siraNo !== right.siraNo) return left.siraNo - right.siraNo
        return left.adi.localeCompare(right.adi, 'tr-TR')
      })
  }, [parsedGrupId, query.data])

  const validIdSet = useMemo(() => new Set(items.map((item) => item.id)), [items])

  useEffect(() => {
    if (!parsedGrupId || query.isLoading || query.isFetching) return
    const next = value.filter((id) => validIdSet.has(id))
    if (next.length !== value.length) {
      onChange(next)
    }
  }, [onChange, parsedGrupId, query.isFetching, query.isLoading, validIdSet, value])

  const toggle = (altSecenekId: number) => {
    if (disabled) return
    if (value.includes(altSecenekId)) {
      onChange(value.filter((id) => id !== altSecenekId))
      return
    }
    onChange([...value, altSecenekId])
  }

  const selectAll = () => {
    if (disabled) return
    onChange(items.map((item) => item.id))
  }

  const clearAll = () => {
    if (disabled) return
    onChange([])
  }

  if (!parsedGrupId) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted">{GOSTERILECEK_SECENEKLER_NEED_GRUP}</p>
      </div>
    )
  }

  if (query.isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted">{GOSTERILECEK_SECENEKLER_LOADING}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted">{GOSTERILECEK_SECENEKLER_EMPTY}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3" id={id}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={selectAll}>
            Tümünü seç
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={clearAll}>
            Temizle
          </Button>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-background p-3">
        {items.map((item, index) => (
          <label key={item.id} className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={value.includes(item.id)}
              onChange={() => toggle(item.id)}
              disabled={disabled}
              className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-foreground">
              {index + 1}. {item.adi}
            </span>
          </label>
        ))}
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-muted">
          Hiç işaretlemezseniz anket doldurmada grubun tüm seçenekleri gösterilir.
        </p>
      ) : null}
    </div>
  )
}
