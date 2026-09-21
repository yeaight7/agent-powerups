# AGENTS.md

## Project Type

Marketing site repository: a public landing or content site where the result of a change is measured by conversion, reply rate, signups, or lead volume over time, not only by unit tests.

Copy this file to the repository root and replace every `<placeholder>`. Delete sections that do not apply instead of leaving them empty.

## Assumed Repository Layout

The paths below are examples of a common shape. They are not repository facts. Confirm the real paths first, and correct this section when the repository differs.

```text
<repo-root>/
├─ src/ or site/          page source, templates, components
├─ public/ or static/     assets served as-is
├─ content/               articles, offer copy, page text
├─ analytics/             one record per experiment, plus result reports
├─ package.json           build and preview scripts
├─ <redirects file>       redirects for renamed or removed URLs
└─ AGENTS.md              this file
```

If a path does not exist, ask instead of creating it.

## Working Rules

- Read the site configuration, the existing page copy, and the experiment records in `analytics/` (example path) before proposing a change.
- Change one variable at a time. Two changes in one test produce a verdict about neither.
- Do not change public URLs, form field names, or tracking parameters without explicit approval; they break attribution and inbound links.
- Never rewrite an existing experiment record. Append a new result file instead.
- Do not invent traffic, conversion, revenue, reply-rate, or benchmark numbers. Use only figures from the experiment records or figures the user supplied in this session.
- Do not present third-party case studies or industry benchmarks as this project's data.
- Do not publish, deploy, send email, or launch paid spend without explicit approval.
- Do not copy competitor page copy verbatim; state the offer in this project's own words.
- Do not add trackers, popups, chat widgets, or third-party scripts without approval.
- Never add secrets, analytics keys, or customer data to the repository, examples, or copy.

## Experiment Volume Floors

Below these floors a result cannot be distinguished from noise. Do not describe a smaller sample as working, promising, or trending.

| Experiment | Minimum before the result means anything |
| --- | --- |
| Cold outreach reply-rate comparison | about 1,500–2,000 sends per variant |
| Subject-line or message test | 100–500 sends per version |
| Landing-page or offer smoke test | 100–200 visitors per variant |
| Paid traffic | judge only after 1–3 times the target cost per acquisition, over at least 48–72 hours of delivery |

- Floors are per variant, not combined across variants.
- Report the observed sample size beside every result.
- Below the floor, the only valid verdict is `insufficient data`.

## Pre-Declared Kill Rules

Before a test starts, record in `analytics/` (example path): the channel, the single changed variable, the metric, the floor from the table above, the decision date, and the number that kills the variant.

- A variant that has not cleared its floor by the decision date is killed or reset, not extended by default.
- Do not extend a test, change its metric, or add variants after seeing the data.
- Judge channels on evidence from tagged links: an untagged link cannot be reported on, and cannot be killed on evidence either.
- If hand-run outreach to the first prospects produces nothing, that is the result. The fix is the offer or the positioning, not more volume.
- Do not recommend paid channels to a project that has no proven demand from manual outreach yet.
- When every pre-declared variant has failed, say so plainly and treat that as the input for the next hypothesis instead of repeating the same test.

## Reporting a Verdict

Report each result in this shape and nothing longer:

1. What was tested, including the one variable that changed.
2. Channel, audience, and date range.
3. Sample size per variant, next to the floor it was compared against.
4. Result per variant, with raw counts beside every percentage.
5. Verdict: `keep`, `kill`, `rerun`, or `insufficient data`.
6. Where the record lives.

## When Data Is Insufficient

- Say so in one line instead of filling the gap with plausible numbers.
- Name the floor that was missed and how much more volume or time it needs.
- Propose the cheapest next step that would close the gap.
- Do not scale spend, headcount, or automation on an unmeasured result.

## Validation

1. Preview the change with the repository's documented command. If no preview command is documented, ask instead of inventing one.
2. Confirm every link, form action, and tracking parameter still points to the same destination.
3. Confirm each changed page keeps its title, description, and canonical URL.
4. Run the checks the repository already defines, such as build, lint, or HTML validation. Do not add tooling without approval.
5. State exactly which checks were run, which were skipped, and what remains unverified.

## Safety

- No fake testimonials, fake scarcity, invented results, or unverifiable claims. Bold marketing, never a false claim.
- No real customer names, emails, quotes, or logos without written permission.
- No authentication, payment, or admin surfaces in the marketing site without explicit scope approval.
- Deployment and spend are always human actions.
