export const approvedCents = async (db: D1Database, jobId: string) => {
  const approved = await db.prepare("SELECT COALESCE(SUM(amount_cents), 0) AS s FROM change_orders WHERE job_id = ? AND status = 'approved'")
    .bind(jobId).first<{ s: number }>()

  return approved?.s ?? 0
}
