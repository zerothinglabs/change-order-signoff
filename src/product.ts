import { Hono } from 'hono'
import { appPage } from './api/app-page'
import { createCo } from './api/create-co'
import { createJob } from './api/create-job'
import { createWorkspace } from './api/create-workspace'
import { deleteCo } from './api/delete-co'
import { exportJobCsv } from './api/export-job-csv'
import { getCo } from './api/get-co'
import { getJob } from './api/get-job'
import { getJobs } from './api/get-jobs'
import { getLogo } from './api/get-logo'
import { getPhoto } from './api/get-photo'
import { getSignedPdf } from './api/get-signed-pdf'
import { getSigning } from './api/get-signing'
import { getSigningLogo } from './api/get-signing-logo'
import { getSigningPhoto } from './api/get-signing-photo'
import { getVerification } from './api/get-verification'
import { getWorkspace } from './api/get-workspace'
import { postLogo } from './api/post-logo'
import { postPhoto } from './api/post-photo'
import { postSend } from './api/post-send'
import { postSignature } from './api/post-signature'
import { postVoid } from './api/post-void'
import { putCo } from './api/put-co'
import { putWorkspace } from './api/put-workspace'
import { signingPage } from './api/signing-page'
import { sitemap } from './api/sitemap'
import { verifyPage } from './api/verify-page'
import { ownerAuth } from './api/owner-auth'
import type { Env } from './types'

export const product = new Hono<Env>()

product.post('/api/workspace', createWorkspace)
product.use('/api/workspace', ownerAuth)
product.use('/api/workspace/*', ownerAuth)
product.use('/api/jobs', ownerAuth)
product.use('/api/jobs/*', ownerAuth)
product.use('/api/co', ownerAuth)
product.use('/api/co/*', ownerAuth)
product.get('/api/workspace', getWorkspace)
product.put('/api/workspace', putWorkspace)
product.post('/api/workspace/logo', postLogo)
product.get('/api/workspace/logo', getLogo)
product.get('/api/jobs', getJobs)
product.post('/api/jobs', createJob)
product.get('/api/jobs/:id', getJob)
product.get('/api/jobs/:id/export.csv', exportJobCsv)
product.post('/api/co', createCo)
product.get('/api/co/:id', getCo)
product.put('/api/co/:id', putCo)
product.delete('/api/co/:id', deleteCo)
product.post('/api/co/:id/photos', postPhoto)
product.get('/api/co/:id/photo/:n', getPhoto)
product.post('/api/co/:id/send', postSend)
product.post('/api/co/:id/void', postVoid)
product.get('/api/sign/:token', getSigning)
product.get('/api/sign/:token/photo/:n', getSigningPhoto)
product.get('/api/sign/:token/logo', getSigningLogo)
product.post('/api/sign/:token', postSignature)
product.get('/api/sign/:token/pdf', getSignedPdf)
product.get('/api/verify/:token', getVerification)
product.get('/s/:token', signingPage)
product.get('/verify/:token', verifyPage)
product.get('/app/job/:id', appPage)
product.get('/app/co/new', appPage)
product.get('/app/co/:id', appPage)
product.get('/sitemap.xml', sitemap)
