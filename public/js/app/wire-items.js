import { itemRow } from './item-row.js'
import { recalcItems } from './recalc-items.js'

export function wireItems(list) {
  list.addEventListener('input', () => recalcItems(list))

  list.addEventListener('click', (e) => {
    if (!e.target.classList.contains('i-del') || list.children.length <= 1) return

    e.target.closest('.item').remove()
    recalcItems(list)
  })

  document.getElementById('add-item').onclick = () => {
    if (list.children.length >= 20) return

    list.insertAdjacentHTML('beforeend', itemRow({ desc: '', qty: 1, unit: '' }))
    list.lastElementChild.querySelector('.i-desc').focus()
    recalcItems(list)
  }

  recalcItems(list)
}
