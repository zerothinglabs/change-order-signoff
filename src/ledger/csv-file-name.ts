export const csvFileName = (jobName: string) => `${jobName.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'job'}-change-orders.csv`
