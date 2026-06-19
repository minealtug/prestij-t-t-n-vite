import type { LinkedChildDraft } from '../components/LinkedChildEditor'

export function clearLinkedChildTriggers(items: LinkedChildDraft[]): LinkedChildDraft[] {
  return items.map((item) => ({
    ...item,
    bagliAltSecenekId: '',
    children: clearLinkedChildTriggers(item.children),
  }))
}
