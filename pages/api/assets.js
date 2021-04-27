const mongodb = require("mongodb");

export default async(req, res) => {
    console.log("came", req.body, req.json, req.query);
    const last = req.body.last;
    const limit = req.body.limit;
    console.log(last, limit, "lastslimit");
    const client = new mongodb.MongoClient("mongodb://localhost:27017");
    await client.connect();
    const db = await client.db("crypto");
    const collection = db.collection("assets");
    const assets = await collection.find({}).sort({"date_added": -1}).skip(last ? last: 0).limit(limit? limit: 1);
    // console.log("asset", await assets.toArray());
    return res.status(200).json({assets: await assets.toArray()});
  }
  