"use strict";
const dns = require("native-dns");
const { parallel } = require("async");
const { networkInterfaces } = require("os");

const { MongoDatabase } = require("./mongo-database");
const { CassandraDatabase } = require("./cassandra-database");

const dnsListeningPort = +process.env.DNS_PORT || 53;
const dnsServerAddress = process.env.DNS_SERVER_ADDRESS || "8.8.8.8";
const dnsServerPort = +process.env.DNS_SERVER_PORT || 53;
const dnsServerType = process.env.DNS_SERVER_TYPE || "udp";
const dnsTimeout = +process.env.DNS_TIMEOUT || 1000;

// Mongo is the default target database
const targetDatabase = process.env.TARGET_DATABASE || "mongo";
// Mongo connection information
const mongoUsername = process.env.MONGO_USERNAME || "";
const mongoPassword = process.env.MONGO_PASSWORD || "";
const mongoConnectionString = process.env.MONGO_CONNECTION_STRING || "mongodb://mongo:27017";
// Cassandra connection information
const cassandraUsername = process.env.CASSANDRA_USERNAME || "";
const cassandraPassword = process.env.CASSANDRA_PASSWORD || "";
const cassandraClusterIPs = process.env.CASSANDRA_CLUSTER_IPS || "";
const cassandraDataCenter = process.env.CASSANDRA_DATACENTER || "";

let db = null;

const filter = {};

const interfaces = networkInterfaces();
for (const iFaceName in interfaces) {
  const ip = {};
  let ipName;
  for (const iFace of interfaces[iFaceName]) {
    if (iFace.family === "IPv4") {
      ipName = `ip-${iFace.address.split(".").join("-")}`;
      ip["ipv4"] = iFace.address;
    } else {
      ip["ipv6"] = iFace.address;
    }
    filter[ipName] = ip;
  }
}

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
    if (question.name in filter) {
      if (question.type === 1) {
        response.answer.push(dns["A"]({
          name: question.name,
          type: "A",
          address: filter[question.name]["ipv4"],
          ttl: 3600
        }));  
      } else if (question.type === 28) {
        response.answer.push(dns["AAAA"]({
          name: question.name,
          type: "AAAA",
          address: filter[question.name]["ipv6"],
          ttl: 3600  
        }));
      } else {
        console.error("Unhandled type", question);
      }
    } else {
      f.push((cb) => proxy(question, response, cb));
    }
  });
  parallel(f, async function() {
    response.send();
    try {
      if (db) {
        await db.insert(request, response);
        console.log("Saved request and response to DB");
      }
    } catch (err) {
      console.error("Failed to save request and response to DB", err);
    }
  });
}

function connectToDatabase() {
  if (targetDatabase === "mongo") {
    db = new MongoDatabase();
    db.connect(mongoConnectionString);
  } else if (targetDatabase === "cassandra") {
    db = new CassandraDatabase();
    db.connect();
  } else {
    console.error("Invalid target database", targetDatabase);
  }
}

function handleListening() {
  console.log("Server listening on", server.address());
  connectToDatabase();
}

function handleClose() {
  console.log("server closed", server.address());
  if (db) db.close();
}

const server = dns.createServer();
server.on("listening", handleListening);
server.on("error", (err, _buff, _req, _res) => console.error(err.stack));
server.on("socketError", (err, _socket) => console.error(err));
server.on("request", handleRequest);
server.on("close", handleClose);
server.serve(dnsListeningPort);
