const mongo = require("mongodb");
const database = require("./database");

const mongoClient = mongo.MongoClient;
let mongoDb = null;

module.exports.MongoDatabase = function() {
  database.Database.apply(this, arguments);
};

module.exports.MongoDatabase.prototype = Object.create(database.Database.prototype);

module.exports.MongoDatabase.prototype.constructor = this.MongoDatabase;

module.exports.MongoDatabase.prototype.connect = function(connectionString) {
  mongoClient.connect(connectionString, async function(err, db) {
    console.log("Connecting to mongo");
    if (err) {
      console.log("Failed to connect to mongo");
      throw err;
    }
    mongoDb = db;
    const dbo = mongoDb.db("dns");
    const collections = await mongoDb.db("dns").listCollections({}, { nameOnly: true }).toArray();
    let exists = false;
    collections.every(collection => {
      if (collection.name === "requests") {
        exists = true;
        return false;
      }
      return true;
    });
    if (!exists) {
      dbo.createCollection("requests", function(err, _res) {
        if (err) throw err;
        console.log("dns.requests collection created");
      });
    }
  });
}

module.exports.MongoDatabase.prototype.insert = function(request, response) {
  return new Promise((resolve, reject) => {
    const obj = {
      timestamp: Date.now(),
      request: request,
      response: response
    };
    if (mongoDb) {
      const dbo = mongoDb.db("dns");
      dbo.collection("requests").insertOne(obj, function(err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      });  
    } else {
      reject("mongoDb === null");
    }
  });
}

module.exports.MongoDatabase.prototype.close = function() {
  if (mongoDb) {
    console.log("Closing mongo connection");
    mongoDb.close();
  }
}