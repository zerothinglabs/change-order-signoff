export const listJobs = async (db: D1Database, wsId: string) => {
  const { results } = await db.prepare(
    `SELECT j.id, j.name, j.client_name, j.original_cents,
       COALESCE(SUM(CASE WHEN co.status = 'approved' THEN co.amount_cents END), 0) AS approved_cents,
       COALESCE(SUM(CASE WHEN co.status = 'sent' THEN co.amount_cents END), 0) AS pending_cents,
       COUNT(CASE WHEN co.status = 'sent' THEN 1 END) AS pending_count
     FROM jobs j LEFT JOIN change_orders co ON co.job_id = j.id
     WHERE j.workspace_id = ? GROUP BY j.id ORDER BY j.created_at DESC`,
  ).bind(wsId).all<{ original_cents: number; approved_cents: number }>()

  return results.map((j) => ({ ...j, current_total_cents: j.original_cents + j.approved_cents }))
}
