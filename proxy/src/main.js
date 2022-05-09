"use strict";
const dns = require("native-dns");
const asyncLib = require("async");
const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  database: "dns"
});

conn.connect(function(err) {
  if (err) throw err;
  const sql =
    `CREATE TABLE IF NOT EXISTS requests (
      timestamp TIMESTAMP,
      dnstype VARCHAR(10),
      sourceip VARCHAR(20),
      domain VARCHAR(260),
      querytype VARCHAR(10),
      ttl INTEGER
    )`;
  conn.query(sql, function(err, _result) {
    if (err) throw err;
    console.log("Table created");
  });
});

const dnsListeningPort = +process.env.DNS_PORT || 53;
const dnsServerAddress = process.env.DNS_SERVER_ADDRESS || "8.8.8.8";
const dnsServerPort = +process.env.DNS_SERVER_PORT || 53;
const dnsServerType = process.env.DNS_SERVER_TYPE || "udp";
const dnsTimeout = +process.env.DNS_TIMEOUT || 1000;

let dnsServer = {
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
    console.log("msg", msg);
    msg.answer.forEach(a => {
      response.answer.push(a)
        // write the data to the database
        new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const dnsType = "";
        const sourceIp = "";
        const domain = "";
        const queryType = "";
        const ttl = "";
        const sql = `
          INSERT INTO requests (timestamp, dnstype, sourceip, domain, querytype, ttl)
          VALUES (${timestamp}, ${dnsType}, ${sourceIp}, ${domain}, ${queryType}, ${ttl})`;
        conn.query(sql, function(err, result) {
          if (err) throw err;
          console.log("Inserted 1 record");
        });
      });
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
  asyncLib.parallel(f, function() { response.send(); });
}

let server = dns.createServer();
server.on("listening", () => console.log("Server listening on", server.address()));
server.on("close", () => console.log("server closed", server.address()));
server.on("error", (err, buff, req, res) => console.error(err.stack));
server.on("socketError", (err, socket) => console.error(err));
server.on("request", handleRequest);
server.serve(dnsListeningPort);
