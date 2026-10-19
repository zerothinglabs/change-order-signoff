export function privateLinkCard() {
  return '<div class="card ph-no-capture" data-zt-private><h2>Private dashboard link</h2>' +
    '<p class="small muted">There is no login. This link opens your dashboard on any phone or computer. Anyone who has it can see your jobs, so keep it private.</p>' +
    '<div class="copy-box"><input id="dash-link" readonly aria-label="Private dashboard link"></div>' +
    '<div class="row"><button class="btn btn-outline btn-sm" type="button" id="copy-dash">Copy</button>' +
    '<button class="btn btn-outline btn-sm" type="button" id="sms-dash">Text it to myself</button></div></div>'
}
