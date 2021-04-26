require("dotenv").config()
const coinkey = process.env["COINKEY"];
const rp = require("request-promise");
const functions = require("./functions");
const requestOptions = {
  method: "GET",
  uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
  qs: {
    cryptocurrency_type: "tokens",
    limit: 3,
  },
  headers: {
    "X-CMC_PRO_API_KEY": coinkey,
  },
  json: true,
  gzip: true,
};

rp(requestOptions)
  .then(async (response) => {
    let errors = 0;
    await functions.init();
    const tokens = response["data"];
    for (let token of tokens) {
      try {
        const data = await functions.getData(token);
        console.log("API call response:", data);
        await functions.updateData(data);
      } catch (e) {
        errors += 1;
      }
    }
    // console.log("API call response:", token);
  })
  .catch((err) => {
    console.log("API call error:", err.message);
  });
