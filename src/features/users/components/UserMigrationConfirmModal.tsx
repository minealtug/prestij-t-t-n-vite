import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface UserMigrationConfirmModalProps {
  open: boolean
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function UserMigrationConfirmModal({
  open,
  loading = false,
  onClose,
  onConfirm,
}: UserMigrationConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title="Kullanıcı migrasyonu"
      size="sm"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            Migrasyonu başlat
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-8 w-8 shrink-0 text-amber-600" aria-hidden />
        <div className="space-y-2 text-sm text-foreground">
          <p>
            Tüm kullanıcılara yeni şifre atanacak. Bu işlem geri alınamaz ve yalnızca bir kez
            çalıştırılmalıdır.
          </p>
          <p className="text-muted">
            İşlem tamamlandığında şifre listesi CSV olarak indirilecektir. Dosyayı güvenli bir
            yerde saklayın; e-posta veya mesajlaşma uygulamalarıyla paylaşmayın.
          </p>
        </div>
      </div>
    </Modal>
  )
}
