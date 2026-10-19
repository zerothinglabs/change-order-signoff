export const coBody = (jobId: string, extra: Record<string, unknown> = {}) => ({
  job_id: jobId,
  title: 'Add recessed lights',
  description: 'Four 6 inch LED cans in the kitchen ceiling.',
  items: [{ desc: 'LED can light', qty: 2, unit_cents: 15000 }, { desc: 'Credit for removed fixture', qty: 1, unit_cents: -5000 }],
  days_impact: 2,
  payment_terms: 'Due on completion',
  ...extra,
})
