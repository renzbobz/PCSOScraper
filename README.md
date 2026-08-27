# PCSOScraper

PCSO lotto result scraper

## Installation

```bash
npm i pcso-scraper
```

## Usage

```javascript
import PCSOScraper from "pcso-scraper";

PCSOScraper.scrape({ from: new Date(2026, 1), to: new Date(2026, 2) });
PCSOScraper.scrape({ from: new Date(2026, 1), game: PCSOScraper.Game.Lotto_4D });
```