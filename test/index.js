import PCSOScraper from "../dist/index.js";

const r = await PCSOScraper.scrape({ from: new Date(2025, 1, 12), to: new Date(2025, 1, 16), game: PCSOScraper.Game.Lotto_3D_5PM });
console.log(r);