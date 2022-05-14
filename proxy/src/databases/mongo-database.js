const mongo = require("mongodb");
const { Database } = require("./database");

const mongoClient = mongo.MongoClient;
let mongoDb = null;

const MongoDatabase = function() {
  Database.apply(this, arguments);
};

MongoDatabase.prototype = Object.create(Database.prototype);

MongoDatabase.prototype.constructor = this.MongoDatabase;

MongoDatabase.prototype.connect = function(connectionString) {
  mongoClient.connect(connectionString, async function(err, db) {
    console.log("Connecting to mongo");
    if (err) {
      console.error("Failed to connect to mongo", err);
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

MongoDatabase.prototype.insert = function(response) {
  return new Promise((resolve, reject) => {
    const obj = {
      timestamp: Date.now(),
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

MongoDatabase.prototype.close = function() {
  if (mongoDb) {
    console.log("Closing mongo connection");
    mongoDb.close();
  }
}

module.exports = {
  MongoDatabase
}