"use strict";
let dns = require("native-dns");
let asyncLib = require("async");

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
		console.log("msg", msg);
		msg.answer.forEach(a => response.answer.push(a));
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
