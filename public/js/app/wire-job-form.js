import { submitJob } from './submit-job.js'

export function wireJobForm() {
  const form = document.getElementById('job-form')

  document.getElementById('new-job').onclick = () => {
    form.classList.remove('hidden')
    document.getElementById('j-name').focus()
  }

  document.getElementById('job-cancel').onclick = () => { form.classList.add('hidden') }

  form.onsubmit = submitJob
}
