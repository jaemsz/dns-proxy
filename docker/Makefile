.DEFAULT_GOAL:=help

COMPOSE_POSTGRES := -f docker-compose.postgres.yml
COMPOSE_MONGO := -f docker-compose.mongo.yml

# --------------------------

# load .env so that Docker Swarm Commands has .env values too. (https://github.com/moby/moby/issues/29133)
include .env
export

# --------------------------
.PHONY: help build up start down destroy stop restart logs
# c : container name
# t : logs line count to be tailed
# examples : 
#		make build  			--> buils all containers
#		make build c="postgres" 	--> builds postgresql container
#		make up					--> start all containers
#		make up	c="postgres"		--> start postgresql container
#		make logs c="postgres"	t=100	--> get postgresql container's last 100 lines
#

help:
	@echo " c : container name"
	@echo " t : logs line count to be tailed"
	@echo " examples :"
	@echo "		make build  			--> buils all containers"
	@echo "		make build c="postgresql" 	--> builds postgresql container"
	@echo "		make up					--> start all containers"
	@echo "		make up	c="postgresql"		--> start postgresql container"
	@echo "		make logs c="postgresql"	t=100	--> get postgresql container last 100 lines"

build_mongo:	## Build
	@docker-compose ${COMPOSE_MONGO} build

build_postgres:	## Build
	@docker-compose ${COMPOSE_POSTGRES} build

up_mongo:	## Start DnsWarrior
	@docker-compose ${COMPOSE_MONGO} up -d

up_postgres:	## Start DnsWarrior
	@docker-compose ${COMPOSE_POSTGRES} up -d

start:	
	@docker-compose ${COMPOSE_POSTGRES} start ${c}

down:			
	@docker-compose ${COMPOSE_POSTGRES} down ${c}

destroy:			
	@docker-compose ${COMPOSE_POSTGRES} down -v ${c}

stop:
	@docker-compose ${COMPOSE_POSTGRES} stop ${c}

restart:
	@docker-compose ${COMPOSE_POSTGRES} restart ${c}

logs:
	@docker-compose ${COMPOSE_POSTGRES} logs --tail=${t} -f $(c)

