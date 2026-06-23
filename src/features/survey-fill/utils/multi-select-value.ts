export function parseMultiSelectValue(value: string): number[] {
  if (!value.trim()) return []

  return value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0)
}

export function formatMultiSelectValue(ids: number[]): string {
  return ids.join(',')
}

export function toggleMultiSelectValue(
  value: string,
  optionId: number,
  checked: boolean,
): string {
  const ids = new Set(parseMultiSelectValue(value))

  if (checked) ids.add(optionId)
  else ids.delete(optionId)

  return formatMultiSelectValue([...ids])
}

export function isMultiSelectValueAnswered(value: string): boolean {
  return parseMultiSelectValue(value).length > 0
}
