export const PAGE_WIDTH = 612
export const PAGE_HEIGHT = 792
export const MARGIN = 50

export const ITEM_COLUMNS = {
  desc: { x: MARGIN, w: 280 },
  qty: { x: MARGIN + 290, w: 50 },
  unit: { x: MARGIN + 345, w: 75 },
  amount: { x: MARGIN + 427, w: PAGE_WIDTH - MARGIN - (MARGIN + 427) },
}

export const TOTAL_COLUMNS = {
  label: { x: MARGIN, w: 340 },
  value: { x: MARGIN + 345, w: PAGE_WIDTH - MARGIN - (MARGIN + 345) },
}
