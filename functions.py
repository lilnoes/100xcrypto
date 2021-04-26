import cloudscraper
from bs4 import BeautifulSoup as bs4
import cloudscraper
import pymongo
from pymongo import MongoClient
scraper = cloudscraper.create_scraper()


def getHolders(address, type = "bnb"):
    type = type.lower()
    if type == "bnb":
        return getBnb(address)
    elif type == "eth":
        return getEth(address)
    else:
        return None

def getBnb(address):
    res = scraper.get(f"https://bscscan.com/token/{address}")
    html = bs4(res.text)
    strings = html.select("div#ContentPlaceHolder1_tr_tokenHolders")[0].strings
    strings = [i.strip() for i in strings if len(i)>2]
    holders = strings[1].replace(",", "")
    holders = holders.replace("addresses", "").strip()

    strings = list(html.select("span#totaltxns")[0].strings)
    transfers = strings[0].replace(",", "")
    try:
        return (int(holders), int(transfers))
    except:
        return None

def getEth(address):
    print(address)
    res = scraper.get(f"https://etherscan.io/token/{address}")
    html = bs4(res.text)
    strings = html.select("div#ContentPlaceHolder1_tr_tokenHolders")[0].strings
    strings = [i.strip() for i in strings if len(i)>2]
    print(strings)
    holders = strings[1].replace(",", "")
    holders = holders.replace("addresses", "").strip()

    strings = list(html.select("span#totaltxns")[0].strings)
    print(strings)
    transfers = strings[0].replace(",", "")
    return (int(holders), int(transfers))


def newAddress(db, address, protocol = "BNB"):
    res = db.assets.find_one({"address": address})
    if res is not None:
        return False

def getData(token):
    quote = token["quote"]["USD"]
    holderstx = getHolders(token["platform"]["token_address"], token["platform"]["symbol"])
    if data is None:
        return False
    return {
        "name": token["name"],
        "symbol": token["symbol"],
        "token_address": token["platform"]["token_address"],
        "platform": token["platform"]["symbol"],
        "price": quote["price"],
        "volume_24h": quote["volume_24h"],
        "volume_7d": quote["volume_7d"],
        "volume_30d": quote["volume_30d"],
        "market_cap": quote["market_cap"],
        "percent_change_24h": quote["percent_change_24h"],
        "holders": holderstx[0],
        "transfers": holderstx[1],
    }
    
