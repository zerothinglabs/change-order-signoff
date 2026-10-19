import { esc } from '../shared/esc.js'
import { money } from '../shared/money.js'

export function signFormHtml(d) {
  return '<form class="card" id="sign-form" novalidate><h2>Your decision</h2>' +
    '<div class="field"><label for="name">Your full name</label><input id="name" autocomplete="name" maxlength="80" required></div>' +
    '<div class="field"><label id="pad-label">Sign here with your finger or mouse</label>' +
    '<div class="pad-wrap"><canvas id="pad" class="ph-no-capture" data-zt-private role="img" aria-labelledby="pad-label"></canvas><span class="pad-line"></span><span class="pad-x" aria-hidden="true">x</span></div>' +
    '<div class="row"><button class="btn-link small" type="button" id="clear">Clear</button><button class="btn-link small" type="button" id="typed">Use my typed name as my signature</button></div></div>' +
    '<label class="check"><input type="checkbox" id="agree"> <span data-zt-private>I approve this change and agree to the amount of ' + esc(money(d.amount_cents)) + '.</span></label>' +
    '<button class="btn btn-block" type="submit" id="approve" disabled>Approve &amp; sign</button>' +
    '<p class="small muted" id="need" aria-live="polite"></p>' +
    '<div id="sign-msg"></div>' +
    '<div><button class="btn-link" type="button" id="decline-toggle" aria-expanded="false" aria-controls="decline">Decline</button></div>' +
    '<div id="decline" class="stack-sm hidden"><div class="field"><label for="reason">Reason (optional)</label><textarea id="reason" class="short" maxlength="500"></textarea></div>' +
    '<p class="small muted">Declining still needs your name and signature so your contractor has a record of it.</p>' +
    '<button class="btn btn-outline" type="button" id="decline-btn" disabled>Decline change order</button></div></form>'
}
