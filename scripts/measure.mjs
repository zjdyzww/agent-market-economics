// @module measure-open-door-payouts
// @path scripts/measure.mjs
// @description Reproduces this repo's headline numbers from Open Door's public payout ledger: paginate /v4/ledger/payouts to exhaustion, then print count, total, min/median/mean/max, the share of payments at or below $0.40, and how much of the total value sits in the top few payments. Anyone can run it and get the same numbers; if the platform's ledger grows, the script reports the new state rather than the old claim.
// @skill measure_payouts — fetch all payouts (cursor pagination) -> aggregate -> print a machine-readable JSON summary
// @rule no_hardcoded_numbers P0 — every figure printed is computed from the live endpoint in this run; nothing is copied from the README.
// @rule report_n_not_number P0 — when the ledger is empty or unreachable the script says so and exits non-zero instead of printing a zero that looks like a measurement.
// @depends node 18+ (global fetch)
// @error no_data — empty ledger or fetch failure -> exit 2 with an explicit message
// @metric payouts_measured [type:counter]
// usage: node scripts/measure.mjs [--out summary.json]

const BASE = 'https://opendooragents.com/v4/ledger/payouts';

async function fetchAll() {
  const rows = [];
  let cursor = null;
  for (let page = 0; page < 100; page++) {
    const url = cursor ? `${BASE}?cursor=${encodeURIComponent(cursor)}` : BASE;
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`ledger fetch failed: HTTP ${res.status}`);
    const body = await res.json();
    const data = body.data ?? body;
    const items = data.items ?? [];
    rows.push(...items);
    cursor = data.next_cursor ?? null;
    if (!cursor || items.length === 0) break;
  }
  return rows;
}

function summary(rows) {
  const v = rows.map((r) => Number(r.tokens)).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (v.length === 0) return null;
  const sum = v.reduce((a, b) => a + b, 0);
  const at = (p) => v[Math.min(v.length - 1, Math.floor(p * (v.length - 1)))];
  const leq40 = v.filter((x) => x <= 40).length;
  const over100 = v.filter((x) => x > 100);
  return {
    payments: v.length,
    total_odt: sum,
    total_usd: +(sum / 100).toFixed(2),
    min_usd: +(v[0] / 100).toFixed(2),
    median_usd: +(at(0.5) / 100).toFixed(2),
    mean_usd: +(sum / v.length / 100).toFixed(2),
    max_usd: +(v[v.length - 1] / 100).toFixed(2),
    share_payments_leq_040: +(100 * leq40 / v.length).toFixed(1),
    payments_over_100_odt: over100.length,
    share_value_from_over_100: +(100 * over100.reduce((a, b) => a + b, 0) / sum).toFixed(1),
    observed_at: new Date().toISOString(),
  };
}

const rows = await fetchAll();
const s = summary(rows);
if (!s) {
  console.error('no_data: the ledger returned no rows; refusing to print a summary that would look like a measurement');
  process.exit(2);
}
const outIdx = process.argv.indexOf('--out');
if (outIdx > -1) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(process.argv[outIdx + 1], JSON.stringify({ summary: s, rows }, null, 1));
}
console.log(JSON.stringify(s, null, 2));
