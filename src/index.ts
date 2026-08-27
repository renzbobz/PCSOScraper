import HTMLParser from "node-html-parser";

enum PCSOGame {
  UltraLotto,
  GrandLotto,
  SuperLotto,
  MegaLotto,
  Lotto,
  Lotto_6D,
  Lotto_4D,
  Lotto_3D_2PM,
  Lotto_3D_5PM,
  Lotto_3D_9PM,
  Lotto_2D_2PM,
  Lotto_2D_5PM,
  Lotto_2D_9PM,
}

enum PCSOGameByName {
  "Ultra Lotto 6/58" = PCSOGame.UltraLotto,
  "Grand Lotto 6/55" = PCSOGame.GrandLotto,
  "Superlotto 6/49" = PCSOGame.SuperLotto,
  "Megalotto 6/45" = PCSOGame.MegaLotto,
  "Lotto 6/42" = PCSOGame.Lotto,
  "6D Lotto" = PCSOGame.Lotto_6D,
  "4D Lotto" = PCSOGame.Lotto_4D,
  "3D Lotto 2PM" = PCSOGame.Lotto_3D_2PM,
  "3D Lotto 5PM" = PCSOGame.Lotto_3D_5PM,
  "3D Lotto 9PM" = PCSOGame.Lotto_3D_9PM,
  "2D Lotto 2PM" = PCSOGame.Lotto_2D_2PM,
  "2D Lotto 5PM" = PCSOGame.Lotto_2D_5PM,
  "2D Lotto 9PM" = PCSOGame.Lotto_2D_9PM,
}

const PCSOSearchGame = {
  AllGames: 0,
  [PCSOGame.SuperLotto]: 1,
  [PCSOGame.MegaLotto]: 2,
  [PCSOGame.Lotto_6D]: 5,
  [PCSOGame.Lotto_4D]: 6,
  [PCSOGame.Lotto_3D_2PM]: 8,
  [PCSOGame.Lotto_3D_5PM]: 9,
  [PCSOGame.Lotto_3D_9PM]: 10,
  [PCSOGame.Lotto_2D_9PM]: 11,
  [PCSOGame.Lotto]: 13,
  [PCSOGame.Lotto_2D_2PM]: 15,
  [PCSOGame.Lotto_2D_5PM]: 16,
  [PCSOGame.GrandLotto]: 17,
};

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface IOpts {
  from: Date;
  /** (default: "from" value) */
  to?: Date;
  /** (default: all) */
  game?: PCSOGame;
  /** (default: 15_000) http timeout ms */
  timeout?: number;
  /** http user agent */
  userAgent?: string;
}

export interface IResultItem {
  game: PCSOGame;
  combinations: number[];
  drawDate: Date;
  jackpot: number;
  winners: number;
}

let prevDom: HTMLParser.HTMLElement;

function extractHiddenInputValues(dom = prevDom) {
  try {
    const els = dom.querySelectorAll('input[type="hidden"]');
    return els.reduce((acc, el) => Object.assign(acc, { [el.getAttribute("name")!]: el.getAttribute("value") }), {} as Record<string, string>);
  } catch(cause) {
    throw new Error("[PCSOScraper.extractHiddenInputValues]", { cause });
  }
}

function extractLottoResults(dom = prevDom) {
  try {
    const formatVal = (i: number, v: string) => {
      switch (i) {
        case 0:
          return { game: PCSOGameByName[v as unknown as number] };
        case 1:
          return { combinations: v.split("-").map((n) => parseInt(n)) };
        case 2: 
          return { drawDate: new Date(v) };
        case 3: 
          return { jackpot: parseFloat(v.replace(/,/g, '')) };
        case 4: 
          return { winners: parseInt(v) };
        default:
          return {};
      }
    };
    const label = dom.querySelector("#cphContainer_cpContent_lblError")?.textContent.trim();
    if (label == "Search Results") {
      const trs = dom.querySelectorAll("table.search-lotto-result-table tr").slice(1);
      return trs.map((tr) => tr.querySelectorAll("td").reduce((item, td, i) => Object.assign(item, formatVal(i, td.textContent.trim())), {} as IResultItem));
    } else {
      if (label == "Data is unavailable.") {
        return [];
      } else {
        throw new Error(label || "Unknown web error");
      }
    }
  } catch(cause) {
    throw new Error("[PCSOScraper.extractLottoResults]", { cause });
  }
}

async function request({ payload, timeout, userAgent }: { userAgent: string; timeout: number; payload?: FormData }) {
  try {
    const url = "https://www.pcso.gov.ph/searchlottoresult.aspx";
    const config: RequestInit = {
      method: payload ? "POST" : "GET",
      headers: { 
        "User-Agent": userAgent ,
        Referer: url
      },
      signal: AbortSignal.timeout(timeout)
    };
    if (payload) config.body = payload;
    const res = await fetch(url, config);
    if (res.ok) {
      prevDom = HTMLParser.parse(await res.text());
    } else {
      throw new Error(res.status + ":" + res.statusText);
    }
  } catch(cause ) {
    throw new Error("[PCSOScraper.request]", { cause });
  }
}

/**
 * @throws {Error}
 */
async function PCSOScraper({ from: fromDate, to: toDate = fromDate, game, timeout = 15_000, userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36" }: IOpts) {
  try {
    if (!prevDom) await request({ timeout, userAgent });

    const values: Record<string, any> = {
      ...extractHiddenInputValues(),
      "ctl00$ctl00$cphContainer$cpContent$ddlStartMonth": months[fromDate.getMonth()],
      "ctl00$ctl00$cphContainer$cpContent$ddlStartDate": fromDate.getDate(),
      "ctl00$ctl00$cphContainer$cpContent$ddlStartYear": fromDate.getFullYear(),
      "ctl00$ctl00$cphContainer$cpContent$ddlEndMonth": months[toDate.getMonth()],
      "ctl00$ctl00$cphContainer$cpContent$ddlEndDay": toDate.getDate(),
      "ctl00$ctl00$cphContainer$cpContent$ddlEndYear": toDate.getFullYear(),
      "ctl00$ctl00$cphContainer$cpContent$ddlSelectGame": game ? PCSOSearchGame[game] : PCSOSearchGame.AllGames,
      "ctl00$ctl00$cphContainer$cpContent$btnSearch": "Search Lotto"
    };

    const payload = new FormData();
    for (const key in values) {
      payload.set(key, values[key].toString());
    }

    await request({ timeout, userAgent, payload });

    return extractLottoResults();
  } catch(cause) {
    throw new Error("[PCSOScraper.main]", { cause });
  }
}

export default { scrape: PCSOScraper, Game: PCSOGame, GameByName: PCSOGameByName };