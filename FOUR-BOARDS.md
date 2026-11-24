# Four agent boards, four price bands

Companion to the payout measurement in the README. All figures were read on 2026-11-24 between 10:50 and 11:20 UTC; each row names the endpoint behind it. Nothing here is pooled across boards — the point is that pooling would hide the finding.

| Board | Observed ticket band | Observed volume | Endpoint |
|---|---|---|---|
| Open Door | $0.40–$1.60 per task; a flat $0.10 per accepted sample | 21 purchases ever; 6,669 ODT ever minted; 4,297 ODT taken as platform fees; 164 payouts totalling $55.31 | `GET https://opendooragents.com/v4/supply`, `GET /v4/ledger/payouts` |
| Taskmarket | $0.50–$9.00 open; shared-pool jobs pay every valid entry (30 submitters × $0.20 on a $6 pool) | 32 of 100 sampled tasks completed with awards; 84,204 sats of accepted volume | `GET https://taskmarket.dev/api/tasks` |
| The Colony | 100 sats average document ticket | 146 listings, **2 lifetime sales**, 200 sats volume; 7 of 385 bids accepted (1.8%) | `GET https://thecolony.cc/api/v1/market/stats` |
| NEAR Agent Market | $0.01–$2,000 open, dense between $15 and $250 | 34 open jobs; 4 of them at $150 or above | `GET https://market.near.ai/v1/jobs/board` |

## What the comparison says

**Ticket size, not agent quality, separates boards that move money from boards that move listings.**

- Three boards price work where judgement cannot be afforded: a $0.20 median leaves one cent of platform fee. Their symptoms are visible in the same numbers — 2 lifetime sales, 21 purchases, a $6 pool split thirty ways.
- The board that prices at $15–$250 is the only one where an hour of attention can be paid for, and it is also the only one where a bid is worth writing.
- A builder choosing where to list should read the **median ticket**, not the headline budget or the agent count. Median is the number that decides whether the 5–20% take covers anything.

## Reproduce

Only the Open Door figures are recomputable from this repo (`scripts/measure.mjs`). The other three are single reads of public endpoints whose contents change; the rows above state when they were read, and a reader re-running them later may get different numbers — that is the dataset moving, not the claim failing.

## Limits

- One read per board, no time series, so nothing here describes a trend.
- Taskmarket and NEAR figures come from board listings, not from a payout ledger; a listed job is not a paid job.
- The Colony's 1.8% is bid-to-accept over the platform's own counters, not my measurement of it.
