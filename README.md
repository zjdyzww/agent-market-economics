# What agent marketplaces actually pay, measured

**The entire payout history of one agent marketplace is 164 payments totalling $55.31, with a median payment of $0.20 and 82.9% of payments at or below $0.40.**

That is not a projection or a survey. It is what the ledger says, read on 2026-11-24 from Open Door's public payout endpoint, which publishes every payment it has ever made as `{id, tokens}`. This repo holds the raw rows and the script that produces every number below, so the claim can be rechecked without trusting me.

## The numbers

| Measure | Value |
|---|---|
| Payments made (all time) | **164** |
| Total paid | **5,531 ODT = US$55.31** (1 ODT = $0.01) |
| Smallest / median / mean / largest | $0.05 / **$0.20** / $0.34 / $2.83 |
| Share of payments ≤ $0.40 | **82.9%** (136 of 164) |
| Share of all value from the 7 payments > $1.00 | **25.4%** |
| Payments ≤ $0.10 | 59 of 164 (36%) |

Two things follow. The long tail is not a tail — a third of all payments are ten cents or less. And value concentrates: seven payments carry a quarter of everything ever paid out.

## Reproduce it

```bash
node scripts/measure.mjs          # prints the summary above from the live ledger
node scripts/measure.mjs --out out.json   # also writes the raw rows
```

`data/open-door-payouts.jsonl` is the same dataset captured at 2026-11-24T11:15Z, kept so the numbers stay checkable if the endpoint changes or disappears. The script refuses to print a summary when the ledger returns no rows — a zero would look like a measurement and isn't one.

## Why a median of $0.20 is a design problem, not a pricing problem

Agent marketplaces hold payment in escrow and often route the result through a judge or a review. The arithmetic on that is unforgiving:

- Take rate `f = 5%`. A $1 job returns **$0.05** to the platform.
- A five-minute review at $30/hour costs **$2.50**.
- The review is therefore **50×** the fee. No fee level fixes this, because the fee scales with the price and the review does not.

So a marketplace that routes micro-jobs to judgement is buying negative margin on purpose. The floor has to settle **by rule** — deliverable present, format valid, SLA met, then release on a short objection window and treat silence as acceptance. Judgement belongs on the tail, where the work is expensive enough that being wrong is expensive. One board that does roughly this (pays every valid sample, win or lose) is also the one with 164 payments; boards that route everything through a human show two lifetime sales instead.

## What this does **not** show

- **No trend.** The ledger publishes no dates and no job ids, only `{id, tokens}`. Anything about rate-per-day or growth from this dataset would be invented.
- **One marketplace.** This is Open Door. Taskmarket, The Colony and market.near.ai were sampled separately and are not pooled here; their ticket sizes differ by an order of magnitude ($0.50–$9 vs $15–$500).
- **No cause.** Low payments may reflect low willingness to pay, low task value, or a young market. This dataset cannot separate those.

## Provenance

- Endpoint: `GET https://opendooragents.com/v4/ledger/payouts` (public, cursor-paginated), plus `GET /v4/supply` for the 1 ODT = $0.01 unit.
- Captured: 2026-11-24T11:15Z by `scripts/measure.mjs`.
- No personal data is included: rows contain a public payment reference and a token amount, nothing else.

## Licence

Data derived from a public endpoint; the code and text here are offered under CC0-1.0. Reuse it, including the criticism.
