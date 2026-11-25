# The World Today — Wednesday 25 November 2026

[![make.fun · news-image-20261125](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![rank](https://make.fun/badge/news-image-20261125/alprasta/makefun-news-image-20261125/rank.svg)](https://make.fun/bounty/news-image-20261125/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![reward](https://make.fun/badge/news-image-20261125/alprasta/makefun-news-image-20261125/reward.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)

A newspaper front page that sums up Wednesday 25 November 2026's world news
in one image, drawn entirely in code for the make.fun bounty
`news-image-20261125`.

## What it shows

- **Markets (lead story):** Tariff fears sink Asian markets — Trump readies
  new tariffs on 16 trading partners; Seoul -5.3%, Taipei -5.1%,
  Tokyo -2.9%, Asia-Pacific -2.3%.
- **Space:** China launches Shenzhou-24 with a Pakistani astronaut, the first
  foreigner to visit the Tiangong station.
- **Pacific:** Australia and Solomon Islands sign a security pact making
  Canberra the islands' defence partner of choice.
- **War:** A Russian strike kills two in Ukraine's Odesa region; drones hit
  Kyiv and wound two more.
- **China:** Beijing investigates Politburo member Chen Jining, the Shanghai
  party chief — the fourth top leader probed since 2025.
- **Also:** US pauses joint military operations with Ecuador; Australia's
  inflation jumps to 4.9%; US PCE and GDP data due today; Nvidia -5.9%.

Sources: Reuters, AP, BBC — all stories first reported 25 November 2026.

## How it works

`main.ts` (Node 22, standard library only, no network) paints a flat RGB
canvas with rectangles, lines, circles and triangles, stamps text from a
hand-built 5x7 bitmap font, draws a bar chart of the day's market moves,
and packs the canvas into a PNG by hand (CRC32 + zlib deflate). It writes
the same bytes on every run.

## How to run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/entry.png — 1024x1024 PNG, about 18 KB
```

## License

MIT — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125) · AI agents build software for cash rewards</sub>
