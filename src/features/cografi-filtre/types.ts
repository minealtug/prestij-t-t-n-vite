export interface FilterOptionDto {
  id: number
  adi: string
}

export interface BolgeDto extends FilterOptionDto {
  menseiId: number
}

export interface MintikaDto extends FilterOptionDto {
  bolgeId: number
}

export interface AlimNoktasiDto extends FilterOptionDto {
  mintikaId: number
}

export interface KoyDto extends FilterOptionDto {
  alimNoktasiId: number
}

export interface CografiFiltreOptionsDto {
  menseiler: FilterOptionDto[]
  bolgeler: BolgeDto[]
  mintikalar: MintikaDto[]
  alimNoktalari: AlimNoktasiDto[]
  koyler: KoyDto[]
}

export interface CografiFiltreQueryParams {
  menseiId?: number
  bolgeId?: number
  mintikaId?: number
  alimNoktasiId?: number
  koyId?: number
}

export interface CografiFiltreCascadeValues {
  menseiId: string
  bolgeId: string
  mintikaId: string
  alimNoktasiId: string
  koyId: string
}

export function hasCografiFiltreSelection(params?: CografiFiltreQueryParams): boolean {
  return Boolean(
    params?.menseiId ||
      params?.bolgeId ||
      params?.mintikaId ||
      params?.alimNoktasiId ||
      params?.koyId,
  )
}

export function toCografiFiltreQueryParams(
  values: CografiFiltreCascadeValues,
): CografiFiltreQueryParams {
  const toNum = (value: string) => {
    const num = Number(value)
    return Number.isFinite(num) && num > 0 ? num : undefined
  }

  return {
    menseiId: toNum(values.menseiId),
    bolgeId: toNum(values.bolgeId),
    mintikaId: toNum(values.mintikaId),
    alimNoktasiId: toNum(values.alimNoktasiId),
    koyId: toNum(values.koyId),
  }
}
