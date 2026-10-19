export const jobFormHtml = '<form class="card hidden" id="job-form" novalidate><h2>New job</h2>' +
  '<div class="grid-2">' +
  '<div class="field"><label for="j-name">Job name</label><input id="j-name" required maxlength="120" placeholder="Kitchen remodel"></div>' +
  '<div class="field"><label for="j-client">Client name</label><input id="j-client" required maxlength="120" autocomplete="off"></div>' +
  '<div class="field"><label for="j-contact">Client phone (optional)</label><input id="j-contact" type="tel" maxlength="40" autocomplete="off"></div>' +
  '<div class="field"><label for="j-email">Client email (optional)</label><input id="j-email" type="email" maxlength="254" autocomplete="off"><span class="hint">We keep only a hash of it, never the address.</span></div>' +
  '<div class="field"><label for="j-address">Job address (optional)</label><input id="j-address" maxlength="200" autocomplete="off"></div>' +
  '<div class="field"><label for="j-orig">Original contract amount ($)</label><input id="j-orig" inputmode="decimal" placeholder="18400"></div>' +
  '</div><div id="job-msg"></div><div class="row"><button class="btn" type="submit">Add job</button><button class="btn btn-outline" type="button" id="job-cancel">Cancel</button></div></form>'
