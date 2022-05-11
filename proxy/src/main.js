"use strict";
const dns = require("native-dns");
const asyncLib = require("async");
const mongoDatabase = require("./mongo-database");

const dnsListeningPort = +process.env.DNS_PORT || 53;
const dnsServerAddress = process.env.DNS_SERVER_ADDRESS || "8.8.8.8";
const dnsServerPort = +process.env.DNS_SERVER_PORT || 53;
const dnsServerType = process.env.DNS_SERVER_TYPE || "udp";
const dnsTimeout = +process.env.DNS_TIMEOUT || 1000;

const targetDatabase = process.env.TARGET_DATABASE || "mongo";
const mongoConnectionString = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";

let db;

const dnsServer = {
  address: dnsServerAddress,
  port: dnsServerPort,
  type: dnsServerType
};

function proxy(question, response, cb) {
  console.log("proxying", question);
  const request = dns.Request({
    question: question,
    server: dnsServer,
    timeout: dnsTimeout
  });
  request.on("message", (err, msg) => {
    if (err) throw err;
    // console.log("msg", msg);
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
    f.push((cb) => proxy(question, response, cb));
  });
  asyncLib.parallel(f, async function() {
    response.send();
    try {
      const res = await db.insert(request, response)
      console.log("Saved request and response to DB", res);
    } catch (err) {
      console.log("Failed to save request and response to DB", err);
    }
  });
}

function handleListening() {
  console.log("Server listening on", server.address());
  if (targetDatabase === "mongo") {
    db = new mongoDatabase.MongoDatabase();
    db.connect(mongoConnectionString);
  }
}

function handleClose() {
  console.log("server closed", server.address());
  db.close();
}

const server = dns.createServer();
server.on("listening", handleListening);
server.on("error", (err, _buff, _req, _res) => console.error(err.stack));
server.on("socketError", (err, _socket) => console.error(err));
server.on("request", handleRequest);
server.on("close", handleClose);
server.serve(dnsListeningPort);
