import type { UserPlainPasswordExport } from '../types/user-migration.types'

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function downloadPlainPasswordsCsv(rows: UserPlainPasswordExport[]) {
  const header = ['Id', 'UserName', 'FullName', 'PlainPassword']
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [r.id, r.userName, r.fullName, r.plainPassword].map(String).map(escapeCsv).join(','),
    ),
  ]
  const blob = new Blob(['\uFEFF' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `kullanici-sifreleri-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
