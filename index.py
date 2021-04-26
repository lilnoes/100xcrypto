from bs4 import BeautifulSoup as bs4
import cloudscraper
import functions
import pymongo
from pymongo import MongoClient



from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
import json

url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'
parameters = {
    'market_cap_min': 50000,
    'market_cap_max': 10000000000,
    'cryptocurrency_type': 'tokens',
    'limit':3,
}
headers = {
  'Accepts': 'application/json',
  'X-CMC_PRO_API_KEY': coinkey
}

session = Session()
session.headers.update(headers)

try:
  response = session.get(url, params=parameters)
  res = json.loads(response.text)
  data = res["data"]
  for token in data:
      print(functions.getData(token))
except (ConnectionError, Timeout, TooManyRedirects) as e:
  print(e)

# scraper = cloudscraper.create_scraper()
# res = scraper.get("https://bscscan.com/token/0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3")


# html = bs4('''<tr><td>901</td><td><div class="media"><img class="u-xs-avatar mr-2" src="/token/images/BitAsean_28.png"><div class="media-body"><h3 class="h6 mb-0"><a class="text-primary" href="/token/0x2a05d22db079bc40c2f77a1d1ff703a56e631cc1">BitAsean (BAS)</a></h3><p class="d-none d-md-block font-size-1 mb-0">BitAsean is Ethereum-based Token. Their aim is for BitAsean to be the cryptocurrency of the ASEAN region.</p></div></div></td><td class="text-nowrap">$0.0011<div class="small text-secondary">0.000000&nbsp;Btc<span class="d-block">0.000000&nbsp;Eth</span></div></td><td>--</td><td>$9.00</td><td>$4,484.00&nbsp;&nbsp;&nbsp;</td><td>419<br><span class="small text-nowrap" title="No change in Token holders from previous day"> 0.000%</span></td></tr>''', "html.parser")
# table = html.select("table#tblResult tbody > tr")
# print(len(table))


client = MongoClient()
db = client["crypto"]
db.assets.create_index([('name', pymongo.ASCENDING)],unique=True)
print(db["assets"])

# print(functions.getData(html))