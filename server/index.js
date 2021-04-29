require("dotenv").config();
const functions = require("./functions");

async function main(){
  // const stored = true;
  await functions.storeLatestData(false);
  await functions.storeLatestData(true); //call this after storing
  console.log("finished storing data");

  await functions.storeLatestInfo(false);
  for(let i = 0; i<10000; ++i){
  await functions.storeLatestInfo(true);
  console.log("finished storing info", i+1);
  }
}

(async()=>{
  await main();
})();