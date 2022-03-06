const puppeteer = require("puppeteer");
const mongodb = require("mongodb");
const fs = require("fs/promises");
const coinkey = process.env["COINKEY"];
const rp = require("request-promise");
const path = require("path");

let page;
let collection;
const query = [];
let min_date;
let items = 0;
const months = 1;
const max_date = 1000 * 3600 * 24 * 30 * months;

async function storeData(data) {
  const json = JSON.stringify(data);
  await fs.writeFile(path.resolve(__dirname, "dump.json"), json, "utf8");
}

async function readData() {
  console.log(__dirname);
  const file = await fs.readFile(path.resolve(__dirname, "dump.json"));
  return JSON.parse(file);
}

async function init() {
  const browser = await puppeteer.launch({ headless: false });
  console.log("browser ws endpoint", browser.wsEndpoint());
  min_date = new Date(new Date().getTime() - 1000 * 3600);
  //   const browser = await puppeteer.connect({
  //     browserWSEndpoint:
  //       "ws://127.0.0.1:34261/devtools/browser/ed589e43-36b9-4976-b5b6-b2a4d4dcce1c",
  //   });
  page = (await browser.pages())[0];
  const client = new mongodb.MongoClient("mongodb://localhost:27017");
  await client.connect();
  const db = await client.db("crypto");
  collection = db.collection("assets");
}

async function getHolders(address, platform = "bnb") {
  platform = platform.toLowerCase();
  if (platform == "bnb") return getBnb(address);
  else if (platform == "eth") return getEth(address);
  else return null;
}

async function getEth(address) {
  await page.goto(`https://etherscan.io/token/${address}`);
  let holders = await page.$eval(
    "div#ContentPlaceHolder1_tr_tokenHolders",
    (node) => node.innerText
  );
  let transfers = await page.$eval("span#totaltxns", (node) => node.innerText);
  holders = holders.replaceAll("Holders:", "").replaceAll(",", "").trim();
  transfers = transfers.replaceAll(",", "");
  return { holders: parseInt(holders), transfers: parseInt(transfers) };
}

async function getBnb(address) {
  await page.goto(`https://bscscan.com/token/${address}`);
  let holders = await page.$eval(
    "div#ContentPlaceHolder1_tr_tokenHolders",
    (node) => node.innerText
  );
  let transfers = await page.$eval("span#totaltxns", (node) => node.innerText);
  holders = holders.replaceAll("Holders:", "").replaceAll(",", "").trim();
  transfers = transfers.replaceAll(",", "");
  return { holders: parseInt(holders), transfers: parseInt(transfers) };
}

async function updateData(data) {
  delete data["history"];
  await collection.updateOne(
    { name: data["name"] },
    { $push: { history: data }, $set: { ...data } },
    { upsert: true }
  );
}

async function getData(token) {
  const date_added = new Date(token["date_added"]).getTime();
  if (date_added + max_date < new Date().getTime())
    return null;

  res = await collection.findOne({ name: token["name"] });
  if (res != null && res.date >= min_date) return null;
  if (res != null && res.hide == true) return null;

  quote = token["quote"]["USD"];
  holderstx = await getHolders(
    token["platform"]["token_address"],
    token["platform"]["symbol"]
  );
  if (holderstx == null) return null;

  items += 1;

  if (items % 10 == 0) await this.sleep(2000);

  return {
    name: token["name"],
    symbol: token["symbol"],
    hide: false,
    date_added: new Date(token["date_added"]),
    token_address: token["platform"]["token_address"],
    platform: token["platform"]["symbol"],
    price: parseFloat(quote["price"]),
    date: new Date(),
    volume_24h: parseFloat(quote["volume_24h"]),
    volume_7d: parseFloat(quote["volume_7d"]),
    volume_30d: parseFloat(quote["volume_30d"]),
    market_cap: parseFloat(quote["market_cap"]),
    percent_change_24h: parseFloat(quote["percent_change_24h"]),
    holders: holderstx["holders"],
    transfers: holderstx["transfers"],
    history: [],
  };
}

module.exports.init = init;
module.exports.getData = getData;
module.exports.updateData = updateData;
module.exports.storeData = storeData;
module.exports.readData = readData;

module.exports.getLatest = async function (stored) {
  if(stored) return null;
  const requestOptions = {
    method: "GET",
    uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
    qs: {
      cryptocurrency_type: "tokens",
      limit: 5000,
      volume_24h_max: 100000000,
    },
    headers: {
      "X-CMC_PRO_API_KEY": coinkey,
    },
    json: true,
    gzip: true,
  };

  return await rp(requestOptions);
};

module.exports.storeInfo = async function () {
  await this.readQuery();
  console.log("length", query.length);
  const query1 = query.slice(0, 500);
  const uri = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info";
  const requestOptions = {
    method: "GET",
    uri: uri,
    qs: {
      id: query1.join(","),
    },
    headers: {
      "X-CMC_PRO_API_KEY": coinkey,
    },
    json: true,
    gzip: true,
  };

  const data = await rp(requestOptions);
  const tokens = data["data"];
  let count = 0;
  for (let id of query1) {
    count += 1;
    const token = tokens[id];
    const res = await collection.findOne({name: token["name"]});
    if(res && res.hide == true) continue;
    if(res && res.urls != null) continue;
    console.log(token["name"], count);
    token.date_added = new Date(token.date_added)
    await collection.updateOne(
      { name: token["name"] },
      { $set: { ...token } },
      { upsert: true }
    );
  }
  console.log(query.length);
  query.splice(0, 500);
  await this.storeQuery();
  await page.browser().close();
};

module.exports.sleep = async function (milliseconds) {
  return await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

module.exports.storeQuery = async function () {
  const json = JSON.stringify(query);
  await fs.writeFile(path.resolve(__dirname, "query.json"), json, "utf8");
};

module.exports.readQuery = async function () {
  const file = await fs.readFile(path.resolve(__dirname, "query.json"));
  query.splice(0);
  query.push(...JSON.parse(file));
  return query;
};


module.exports.storeLatestData = async function (stored = false) {
  let errors = 0;
  await this.init();
  const data = await this.getLatest(stored);
  if(!stored) await this.storeData(data["data"]);
  if(!stored) {console.log("finished storing latest data"); return;}
  const tokens = await this.readData();
  for (let token of tokens) {
    try {
      const data = await this.getData(token);
      if (data == null) {
        errors += 1;
        console.log("errors", errors, "null data", token["name"]);
        continue;
      }
      console.log(
        "API call response:",
        data["name"],
        data["holders"],
        items
      );
      await this.updateData(data);
    } catch (e) {
      // await functions.storeInfo();
    }
  }
};

module.exports.storeLatestInfo = async function (stored = false) {
  await this.init();
  if(stored) await this.storeInfo();
  if(stored) {console.log("finished storing info"); return;}

  const tokens = await this.readData();
  for (let token of tokens)
      query.push([token["id"]]);
  await this.storeQuery();
  // console.log("API call response:", token);
};
