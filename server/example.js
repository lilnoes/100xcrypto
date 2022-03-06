const mongodb = require("mongodb");


( async () =>{
    const client = new mongodb.MongoClient('mongodb://localhost:27017');
    await client.connect()
    const db = await client.db("crypto")
    const assets = db.collection("assets")
    const cursor = assets.find({})
    cursor.forEach(async function(doc){
        let date_added = new Date(doc.date_added);
        await assets.updateOne({_id: doc._id}, {$set: {date_added: date_added}});
        console.log(doc.symbol);
    })
    // assets.find()
    console.log(assets);
})();