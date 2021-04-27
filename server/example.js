const mongodb = require("mongodb");


// ( async () =>{
//     const client = new mongodb.MongoClient('mongodb://localhost:27017');
//     await client.connect()
//     const db = await client.db("crypto")
//     const assets = db.collection("assets")
//     assets.fin ({name: "name"}, {$push: {history: history}}) 
//     // assets.find()
//     console.log(assets);
// })();

const a = [2, 5, 3]

var b = a.slice(0, 1)
a.splice(0, 1)
console.log(b, a);
