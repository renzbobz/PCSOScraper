import PCSOScraper from "../dist/index.js";

const r = await PCSOScraper.scrape({ from: new Date(2025, 1, 12), to: new Date(2025, 1, 16) });
console.log(r);