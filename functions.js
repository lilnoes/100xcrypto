const puppeteer = require("puppeteer");
const mongodb = require("mongodb");
const browser = await puppeteer.launch({ headless: false });
console.log("browser ws endpoint", browser.wsEndpoint());
let page;
let collection;

async function init() {
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
  res = await collection.findOne({ name: data["name"] });
  data["speed"] = 0;
  if (res != null) {
    console.log(res);
    data["speed"] =
      (data["holders"] - res["history"][0]["holders"]) /
      ((new Date() - res["history"][0]["date"]) * 1000 * 3600);
  }
  delete data["history"];
  collection.updateOne(
    { name: data["name"] },
    { $push: { history: data }, $set: { ...data } },
    { upsert: true }
  );
}

// function newAddress(collection, data){
//     data["history"] = [{date: new Date(), ...data}]
//     collection.updateOne ({name: data["name"]}, {$push: {history: history}})
// }

async function getData(token) {
  quote = token["quote"]["USD"];
  holderstx = await getHolders(
    token["platform"]["token_address"],
    token["platform"]["symbol"]
  );
  if (holderstx == null) return false;

  return {
    name: token["name"],
    symbol: token["symbol"],
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
