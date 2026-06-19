import { Input } from '@/components/ui/Input'
import type { EkiciDefinitionFormValues } from '../types/ekici-definition.types'

interface EkiciDefinitionFormProps {
  values: EkiciDefinitionFormValues
  onChange: (values: EkiciDefinitionFormValues) => void
  disabled?: boolean
  idPrefix?: string
}

function NumberField({
  label,
  value,
  onChange,
  disabled,
  id,
  required = true,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  id: string
  required?: boolean
}) {
  return (
    <Input
      id={id}
      label={label}
      type="number"
      value={Number.isFinite(value) ? String(value) : ''}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      disabled={disabled}
      required={required}
    />
  )
}

export function EkiciDefinitionForm({
  values,
  onChange,
  disabled = false,
  idPrefix = 'ekici',
}: EkiciDefinitionFormProps) {
  const set = <K extends keyof EkiciDefinitionFormValues>(key: K, value: EkiciDefinitionFormValues[K]) => {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Input
        id={`${idPrefix}-tc`}
        label="TC Kimlik No"
        value={values.tcKimlikNo}
        onChange={(e) => set('tcKimlikNo', e.target.value)}
        disabled={disabled}
        required
      />
      <Input
        id={`${idPrefix}-ad`}
        label="Ad"
        value={values.ad}
        onChange={(e) => set('ad', e.target.value)}
        disabled={disabled}
        required
      />
      <Input
        id={`${idPrefix}-soyad`}
        label="Soyad"
        value={values.soyad}
        onChange={(e) => set('soyad', e.target.value)}
        disabled={disabled}
        required
      />
      <Input
        id={`${idPrefix}-baba`}
        label="Baba Adı"
        value={values.babaAdi}
        onChange={(e) => set('babaAdi', e.target.value)}
        disabled={disabled}
        required
      />
      <Input
        id={`${idPrefix}-ana`}
        label="Ana Adı"
        value={values.anaAdi}
        onChange={(e) => set('anaAdi', e.target.value)}
        disabled={disabled}
      />
      <Input
        id={`${idPrefix}-dogum-yeri`}
        label="Doğum Yeri"
        value={values.dogumYeri}
        onChange={(e) => set('dogumYeri', e.target.value)}
        disabled={disabled}
      />
      <Input
        id={`${idPrefix}-dogum-tarihi`}
        label="Doğum Tarihi"
        type="date"
        value={values.dogumTarihi}
        onChange={(e) => set('dogumTarihi', e.target.value)}
        disabled={disabled}
        required
      />
      <NumberField
        id={`${idPrefix}-yil`}
        label="Yıl"
        value={values.yil}
        onChange={(value) => set('yil', value)}
        disabled={disabled}
      />
      <NumberField
        id={`${idPrefix}-mintika`}
        label="Mıntıka ID"
        value={values.mintikaId}
        onChange={(value) => set('mintikaId', value)}
        disabled={disabled}
      />
      <NumberField
        id={`${idPrefix}-bolge`}
        label="Bölge ID"
        value={values.bolgeId}
        onChange={(value) => set('bolgeId', value)}
        disabled={disabled}
      />
      <NumberField
        id={`${idPrefix}-mensei`}
        label="Menşei ID"
        value={values.menseiId}
        onChange={(value) => set('menseiId', value)}
        disabled={disabled}
      />
      <NumberField
        id={`${idPrefix}-alim`}
        label="Alım Noktası ID"
        value={values.alimNoktasiId}
        onChange={(value) => set('alimNoktasiId', value)}
        disabled={disabled}
      />
      <NumberField
        id={`${idPrefix}-koy`}
        label="Köy ID"
        value={values.koyId}
        onChange={(value) => set('koyId', value)}
        disabled={disabled}
      />
      <NumberField
        id={`${idPrefix}-uretim`}
        label="Üretim Merkezi ID"
        value={values.uretimMerkeziId}
        onChange={(value) => set('uretimMerkeziId', value)}
        disabled={disabled}
      />
      <NumberField
        id={`${idPrefix}-ozkont`}
        label="Öz Kont No"
        value={values.ozKontNo}
        onChange={(value) => set('ozKontNo', value)}
        disabled={disabled}
        required={false}
      />
      <Input
        id={`${idPrefix}-makine`}
        label="Makine Kodu"
        value={values.makineKodu}
        onChange={(e) => set('makineKodu', e.target.value.slice(0, 3))}
        disabled={disabled}
        maxLength={3}
        required
      />
      <NumberField
        id={`${idPrefix}-durum`}
        label="Ekici Durum ID"
        value={values.ekiciDurumId}
        onChange={(value) => set('ekiciDurumId', value)}
        disabled={disabled}
      />
      <NumberField
        id={`${idPrefix}-aktif`}
        label="Aktif (1/0)"
        value={values.aktif}
        onChange={(value) => set('aktif', value)}
        disabled={disabled}
      />

      <label className="flex items-center gap-2 text-sm text-foreground md:col-span-2 xl:col-span-3">
        <input
          type="checkbox"
          checked={values.icralik}
          onChange={(e) => set('icralik', e.target.checked)}
          disabled={disabled}
        />
        İcralık
      </label>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={values.temlik}
          onChange={(e) => set('temlik', e.target.checked)}
          disabled={disabled}
        />
        Temlik
      </label>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={values.sozlesmeIptal}
          onChange={(e) => set('sozlesmeIptal', e.target.checked)}
          disabled={disabled}
        />
        Sözleşme İptal
      </label>
    </div>
  )
}
