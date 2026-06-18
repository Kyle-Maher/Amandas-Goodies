// =====================================================================
// Amanda's Goodies — site notices / announcements
//
// To show a message at the top of the site, add an entry to NOTICES.
//   message : the text to display
//   until   : (optional) date the notice auto-hides ON — format YYYY-MM-DD.
//             The notice shows through the day BEFORE this date, then
//             disappears by itself. Omit for a notice with no end date.
//   from    : (optional) date the notice STARTS showing — YYYY-MM-DD.
//             Omit to show immediately.
//
// To remove a notice, delete its entry (or just leave it — it vanishes
// automatically once `until` passes).
// =====================================================================

const NOTICES = [
  {
    message: "Hello! I will be busy at camp from June 21-27th. Feel free to " +
             "submit an order, just know I won't be able to bake anything " +
             "until June 28th. Thank you!!!",
    until: '2026-06-28',
  },
];

// ---------------------------------------------------------------------

// Parse a YYYY-MM-DD string as a LOCAL date (midnight). Using new Date(str)
// would treat it as UTC and can land on the wrong day depending on timezone.
function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Today at local midnight, so date-only comparisons are exact.
function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isActive(notice, now) {
  if (notice.from && now < parseLocalDate(notice.from)) return false;
  if (notice.until && now >= parseLocalDate(notice.until)) return false;
  return true;
}

function renderNotices() {
  const container = document.getElementById('site-notice');
  if (!container) return;
  container.innerHTML = '';

  const now = today();
  NOTICES.filter((n) => isActive(n, now)).forEach((notice) => {
    const bar = document.createElement('div');
    bar.className = 'notice-bar';

    const text = document.createElement('span');
    text.className = 'notice-text';
    text.textContent = notice.message;

    bar.appendChild(text);
    container.appendChild(bar);
  });
}

renderNotices();
