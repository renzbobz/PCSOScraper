# PCSOScraper

Lotto result scraper for [PCSO](https://www.pcso.gov.ph/searchlottoresult.aspx).

## Features

* 🌐 Supports Node.js, browsers, and Cloudflare Workers
* ⚡ Lightweight HTML parsing with `htmlparser2`
* 📦 Minimal dependencies
* 🔄 Uses the native `fetch` API

## Installation

```bash
npm install pcso-scraper
```

## Usage

```javascript
import PCSOScraper from "pcso-scraper";

const results = await PCSOScraper.scrape({ from: new Date(2026, 1, 1) });

console.log(results);
```

## Example Result

```javascript
[
  {
    game: 0,
    combinations: [ 30, 17, 20, 28, 55, 23 ],
    drawDate: 2026-02-01T13:00:00.000Z,
    jackpot: 75000000,
    winners: 0
  },
  {
    game: 2,
    combinations: [ 8, 10, 15, 25, 21, 2 ],
    drawDate: 2026-02-01T13:00:00.000Z,
    jackpot: 26094363.75,
    winners: 0
  },
  {
    game: 7,
    combinations: [ 0, 6, 3 ],
    drawDate: 2026-02-01T06:00:00.000Z,
    jackpot: 4500,
    winners: 110
  },
  {
    game: 8,
    combinations: [ 1, 8, 9 ],
    drawDate: 2026-02-01T09:00:00.000Z,
    jackpot: 4500,
    winners: 280
  },
  {
    game: 9,
    combinations: [ 2, 4, 1 ],
    drawDate: 2026-02-01T13:00:00.000Z,
    jackpot: 4500,
    winners: 561
  },
  {
    game: 10,
    combinations: [ 15, 1 ],
    drawDate: 2026-02-01T06:00:00.000Z,
    jackpot: 4000,
    winners: 146
  },
  {
    game: 11,
    combinations: [ 19, 21 ],
    drawDate: 2026-02-01T09:00:00.000Z,
    jackpot: 4000,
    winners: 130
  },
  {
    game: 12,
    combinations: [ 30, 19 ],
    drawDate: 2026-02-01T13:00:00.000Z,
    jackpot: 4000,
    winners: 176
  }
]
```