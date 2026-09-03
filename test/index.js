import PCSOScraper from "../dist/index.js";

const r = await PCSOScraper.scrape({ from: new Date(2026, 1, 1) });
console.log(r);