import type {
  AnketCevapDto,
  EkiciDto,
  SurveyResponseGroup,
  SurveyResponsesQueryParams,
} from '../types/survey-response.types'
import { filterSurveyResponseGroups, groupAnketCevaplari } from '../utils/map-anket-cevap'

const EKICI_SEED: EkiciDto[] = [
  { id: 'dev-ekici-1', adi: 'Test', soyad: 'Ekici' },
  { id: 'dev-ekici-2', adi: 'Demo', soyad: 'Ekici' },
]

const CEVAP_SEED: AnketCevapDto[] = [
  {
    id: 'resp-1',
    soruId: 1,
    soruMetni: 'Genel memnuniyetiniz?',
    ekiciId: 'dev-ekici-1',
    ekiciAd: 'Test',
    ekiciSoyad: 'Ekici',
    sablonId: 1,
    sablonAdi: 'Sezon Sonu Anketi',
    mintikaId: 1,
    mintikaAdi: 'MERKEZ',
    kullaniciId: 1,
    islemTarihi: '2026-05-20T14:32:00.000Z',
    cevapAltSecenekId: null,
    cevapAltSecenekAdi: null,
    cevapText: 'Çok memnunum',
    cevapNumeric: null,
    cevapDatetime: null,
    birimId: null,
    kaynak: 'Dev',
  },
  {
    id: 'resp-2',
    soruId: 2,
    soruMetni: 'Ürün kalitesi hakkında görüşünüz',
    ekiciId: 'dev-ekici-1',
    ekiciAd: 'Test',
    ekiciSoyad: 'Ekici',
    sablonId: 1,
    sablonAdi: 'Sezon Sonu Anketi',
    mintikaId: 1,
    mintikaAdi: 'MERKEZ',
    kullaniciId: 1,
    islemTarihi: '2026-05-20T14:32:00.000Z',
    cevapAltSecenekId: null,
    cevapAltSecenekAdi: null,
    cevapText: 'Kalite standartların üzerinde',
    cevapNumeric: null,
    cevapDatetime: null,
    birimId: null,
    kaynak: 'Dev',
  },
]

export const devResponsesStore = {
  getEkiciler(): EkiciDto[] {
    return EKICI_SEED
  },

  getByEkici(params: SurveyResponsesQueryParams): SurveyResponseGroup[] {
    if (!params.ekiciId) return []

    const items = CEVAP_SEED.filter((r) => r.ekiciId === params.ekiciId)
    const groups = groupAnketCevaplari(items)
    return filterSurveyResponseGroups(groups, params.search)
  },
}
