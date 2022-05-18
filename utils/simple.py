import dns.name
import dns.message
import dns.query
import dns.flags

# send simple request to the docker udp
def run(server='127.0.0.1',port=54):
    domain = dns.name.from_text('www.google.com')
    if not domain.is_absolute():
        domain = domain.concatenate(dns.name.root)

    q = dns.message.make_query(domain, "A")
    r = dns.query.udp(q, server,port=port)
    print(r)

if __name__ == "__main__":
    run()