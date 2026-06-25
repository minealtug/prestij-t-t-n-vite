import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { UserMigrationResponse } from '../types/user-migration.types'

interface UserMigrationResultModalProps {
  open: boolean
  onClose: () => void
  result?: UserMigrationResponse | null
  error?: string | null
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  )
}

export function UserMigrationResultModal({
  open,
  onClose,
  result,
  error,
}: UserMigrationResultModalProps) {
  const isError = Boolean(error)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isError ? 'Migrasyon başarısız' : 'Migrasyon tamamlandı'}
      size="sm"
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>Tamam</Button>
        </div>
      }
    >
      {isError ? (
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-8 w-8 shrink-0 text-red-600" aria-hidden />
          <p className="text-sm text-foreground">{error}</p>
        </div>
      ) : result ? (
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-emerald-600" aria-hidden />
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-sm text-foreground">{result.message}</p>
            <div className="divide-y divide-border rounded-lg border border-border px-3">
              <StatRow label="Toplam eski kullanıcı" value={result.totalLegacyUsers} />
              <StatRow label="Oluşturulan" value={result.createdCount} />
              <StatRow label="Güncellenen" value={result.updatedCount} />
              <StatRow
                label="Yalnızca uygulama şifresi sıfırlanan"
                value={result.appOnlyPasswordResetCount}
              />
              <StatRow label="CSV'ye aktarılan şifre" value={result.plainPasswords.length} />
            </div>
            <p className="text-xs text-muted">
              Şifre listesi bilgisayarınıza indirildi. Dosyayı güvenli tutun; tekrar indirmek için
              migrasyonu yeniden çalıştırmayın.
            </p>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
