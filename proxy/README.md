# dns-proxy

## Summary
dns-proxy is a nodejs application that is capable of proxying DNS requests and persisting the requests as well as the responses to a database for further analysis.

## Supported Databases
- MongoDB
- ElasticSearch
- Postgresql
- Cassandra

## Configuration
- DNS proxy port
  - default is port 53
- DNS server
  - address
    - default is 8.8.8.8
  - port
    - default is 53
  - type
    - default is udp
- DNS request timeout
  - default is 1000 (1 second)

## How to run dns-proxy on AWS EC2 Ubuntu image
- Port 53 is in use by systemd-resolve, so this service needs to be stopped and disabled.
- Update /etc/resolv.conf
  - nameserver 127.0.0.1
- Install MongoDB
  - Install docker
  - Pull mongodb image
  - Start container
- Clone the git repo
- Run dns-proxy
  - sudo node main.js

## How to modify DNS settings on Windows
- Launch cmd.exe as administrator
- Run netsh.exe
- interface ip show config
  - Find the interface which you want to modify DNS settings (ie. Ethernet 0)
- interface ip set dns "Ethernet 0" static "IP address of DNS proxy"

## TODO
- [ ] Add configuration file
- [ ] Add support for ElasticSearch
- [ ] Add support for Postgresql
- [ ] Add support for Cassandra
- [ ] Add Dockerfile for dns-proxy
- [ ] Add config for Kubernetes cluster
- [ ] Add an express web server to display DNS requests
