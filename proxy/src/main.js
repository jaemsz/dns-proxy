"use strict";
const dns = require("native-dns");
const { parallel } = require("async");
const { hostname } = require("os");

const { MongoDatabase } = require("./databases/mongo-database");
const { CassandraDatabase } = require("./databases/cassandra-database");
const { PostgresqlDatabase } = require("./databases/postgresql-database");

const dnsListeningPort = +process.env.DNS_PORT || 53;
const dnsServerAddress = process.env.DNS_SERVER_ADDRESS || "8.8.8.8";
const dnsServerPort = +process.env.DNS_SERVER_PORT || 53;
const dnsServerType = process.env.DNS_SERVER_TYPE || "udp";
const dnsTimeout = +process.env.DNS_TIMEOUT || 1000;

// Mongo is the default target database
const targetDatabase = process.env.TARGET_DATABASE || "mongo";
// Mongo connection string
const mongoConnectionString = process.env.MONGO_CONNECTION_STRING || "mongodb://mongo:27017";
// Cassandra connection string
const cassandraConnectionString = process.env.CASSANDRA_CONNECTION_STRING || "";
// Postgresql connection string
const psqlConnectionString = process.env.PSQL_CONNECTION_STRING || "";

let db = null;

const hostNameToIP = {
  hostname: hostname(),
  ipv4: "127.0.0.1",
  ipv6: "::1"
};

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

function respondWithLocalhostIP(question, response) {
  if (question.type === 1) {
    response.answer.push(dns["A"]({
      name: question.name,
      type: "A",
      address: hostNameToIP.ipv4,
      ttl: 3600
    }));
  } else if (question.type === 28) {
    response.answer.push(dns["AAAA"]({
      name: question.name,
      type: "AAAA",
      address: hostNameToIP.ipv6,
      ttl: 3600
    }));
  } else {
    console.error("Unhandled type", question);
  }
}

function handleRequest(request, response) {
  const f = [];
  request.question.forEach(question => {
    if (question.name === hostNameToIP.hostname) {
      respondWithLocalhostIP(question, response)
    } else {
      f.push((cb) => proxy(question, response, cb));
    }
  });
  parallel(f, async function() {
    response.send();
    try {
      if (db) {
        await db.insert(response);
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
    db = new CassandraDatabase(cassandraConnectionString);
    db.connect();
  } else if (targetDatabase === "postgresql") {
    db = new PostgresqlDatabase(psqlConnectionString);
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
