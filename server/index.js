require("dotenv").config();
const functions = require("./functions");

(async () => {
  let errors = 0;
  let items = 0;
  await functions.init();
  // const data = await functions.getLatest();
  // await functions.storeData(data["data"]);
  // const tokens = await functions.readData();
  await functions.storeInfo();
  console.log("finished");
  // console.log(query.length);
  return;
  for (let token of tokens) {
    try {
      // await functions.storeInfo();
      // continue;
      const data = await functions.getData(token);
      if (data == null) {
        errors += 1;
        console.log("errors", errors, "null data", token["name"]);
        continue;
      }
      console.log("API call response:", data["name"], data["holders"], functions.items);
      await functions.updateData(data);
    } catch (e) {
      // await functions.storeInfo();
    }
  }
  await functions.storeQuery();
  // console.log("API call response:", token);
})();
