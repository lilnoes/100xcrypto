const mongodb = require("mongodb");


( async () =>{
    const client = new mongodb.MongoClient('mongodb://localhost:27017');
    await client.connect()
    const db = await client.db("crypto")
    const assets = db.collection("assets")
    assets.updateOne ({name: "name"}, {$push: {history: history}}) 
    // assets.find()
    console.log(assets);
// })();

a = [{1: 10}, 2, 3]

for(let i of a){
    console.log(i);
}
