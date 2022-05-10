"use strict";
const dns = require("native-dns");
const asyncLib = require("async");
const mongo = require("mongodb");

const mongoUrl = process.env.DNS_MONGO_URL || "mongodb://localhost:27017/";
const mongoClient = mongo.MongoClient;
let mongoDb = null;

const dnsListeningPort = +process.env.DNS_PORT || 53;
const dnsServerAddress = process.env.DNS_SERVER_ADDRESS || "8.8.8.8";
const dnsServerPort = +process.env.DNS_SERVER_PORT || 53;
const dnsServerType = process.env.DNS_SERVER_TYPE || "udp";
const dnsTimeout = +process.env.DNS_TIMEOUT || 1000;

const dnsServer = {
  address: dnsServerAddress,
  port: dnsServerPort,
  type: dnsServerType
};

function saveMessageToDb(request, response) {
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
      console.log("mongoDb is null");
      reject();
    }
  });
}

function proxy(question, response, cb) {
  console.log("proxying", question);
  const request = dns.Request({
    question: question,
    server: dnsServer,
    timeout: dnsTimeout
  });
  request.on("message", (err, msg) => {
    if (err) throw err;
    console.log("msg", msg);
    msg.answer.forEach(a => {
      response.answer.push(a)
    });
  });
  request.on("end", cb);
  request.send();
}

function handleRequest(request, response) {
  const f = [];
  request.question.forEach(question => {
    f.push(cb => proxy(question, response, cb));
  });
  asyncLib.parallel(f, function() {
    response.send();
    try {
      saveMessageToDb(request, response);
    } catch {
      console.log("saveMessageToDb failed");
    }
  });
}

const server = dns.createServer();
server.on("listening", () => {
  console.log("Server listening on", server.address());
  mongoClient.connect(mongoUrl, function(err, db) {
    console.log("Connecting to mongo");
    if (err) throw err;
    mongoDb = db;
    const dbo = mongoDb.db("dns");
    dbo.createCollection("requests", function(err, _res) {
      if (err) throw err;
      console.log("dns.requests collection created");
    });
  });  
});
server.on("error", (err, _buff, _req, _res) => console.error(err.stack));
server.on("socketError", (err, _socket) => console.error(err));
server.on("request", handleRequest);
server.on("close", () => {
  console.log("server closed", server.address());
  if (mongoDb) mongoDb.close();
});
server.serve(dnsListeningPort);
