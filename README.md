# Measure Bench

[Use Measure Bench](https://coolcode.ca/measurebench/) for transfer-time estimates, storage quantities, energy use and compatible unit conversions. The normal calculator runs entirely in the browser and works without any API key.

<!-- coolcode:guide -->
Try `100 GB at 100 Mbps`: the ideal transfer takes 2 hours, 13 minutes and 20 seconds. Lower the useful-throughput percentage to model overhead. GB and GiB differ; B means bytes and b means bits. Energy estimates include only the energy charge, not fixed fees or taxes.
<!-- /coolcode:guide -->

## What it understands

- `100 GB at 100 Mbps`, `transfer 1 TiB at 110 MB/s`
- `1 TB to GiB`, `72 F to C`, `120 square feet to m2`
- `1500 W for 8 hours at 0.15 CAD/kWh`
- Length, area, mass, volume, time, power, energy, speed and temperature. Unusual units include smoots, hands and nautical miles.

This is a deliberately explicit grammar, not an AI interpreter. It never evaluates JavaScript or general mathematical expressions. Unknown units and incompatible dimensions produce explanations. A plain cup or gallon is ambiguous; use `US cup`, `metric cup`, `US gallon` or `imperial gallon`. Decimal points are supported; commas mean thousands separators. Units are based on exact SI/international definitions and displayed answers are rounded to ten significant digits.

## Optional Wolfram answers

Click **Ask Wolfram** to send only the current question to the shared CoolCode Worker at `POST /api/measurebench/answer`. This never happens automatically after a local-parser failure. The proxy uses `WOLFRAM_APP_ID` as a **Cloudflare Secret**, caches answers and enforces shared limits of 50 uncached attempts per day and 1,000 per calendar month in the existing D1 binding. Failed upstream attempts count; valid cached answers remain available at the cap. No key belongs in this repository, GitHub Pages files or frontend configuration. A quota/connection/configuration error leaves local calculations usable. The app labels external and cached answers separately.

The Worker is maintained centrally; the public endpoint is in `web/config.json`. Query limit: 300 characters. The interface cancels obsolete requests and prevents an older answer from appearing under a changed question. Do not include private information in external queries.

## Privacy

Local inputs stay in tab memory, with no localStorage, history or query-string persistence. The optional external button sends the query to CoolCode and Wolfram; the proxy may cache it according to its published configuration. CoolCode's standard page-open counter receives the tool ID, not calculator text. Copy uses the browser clipboard on request.

## Expand or customize

Edit `web/config.json` to add or reorder example buttons; each has `label` and `query`. Examples do not constrain valid inputs. Add an extra example such as `327.5 nautical miles to km`, run the checks below, then push to `main` to publish. Add unit definitions/aliases in `web/model.mjs`; keep dimensions explicit and add numerical tests for conversion factors and offsets. No data refresh is required and no scheduled collector/watchdog freshness probe is needed.

```sh
node --test tests/*.test.mjs
python3 -m unittest discover -s tests -v
python3 scripts/build.py
```

GitHub Actions also exercises Chromium at a project subpath and a 390px viewport. The main branch deploys `dist/` to GitHub Pages after checks; PRs never publish. `dist/` is generated and untracked. API availability is independently observable from the optional answer button; local tests mock that service.

## References

- [NIST SI units](https://www.nist.gov/pml/owm/metric-si/si-units)
- [NIST binary prefixes](https://physics.nist.gov/cuu/Units/binary.html)
- [Wolfram Short Answers API](https://products.wolframalpha.com/short-answers-api/documentation)

This calculator provides practical estimates. It does not model changing network throughput, appliance duty cycles, tiered electricity tariffs or engineering tolerances.

## Ready-to-use example

[How Long Will a 10 GB Upload Take at 20 Mbps?](https://coolcode.ca/measurebench/upload-time.html) opens this scenario in the same tool. A 10 GB file contains 80 billion bits in decimal units. At 20 Mbps it takes about 1 hour, 6 minutes and 40 seconds before overhead. Change the file size, upload speed or useful throughput percentage to estimate your transfer.
