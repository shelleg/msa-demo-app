## Microservice demo application for training purposes

1. #### msa-api
The api service which:
  * Returns the current pinger value when `/` is called
  * Increments the value of key by 1 every time `/ping` is called
  * Says "its aaallive!" when `/isAlive` is called
  * `service liveness probe` returns 200 OK when `/probe/liveness` is called
  * `service readiness probe` returns 200 OK when `/probe/readiness` is called and redis is actually responding to the service


2. #### msa-pinger
A "shell script entry point" service which increments the pinger in the via `/ping` in the msa-api every 1 sec.


3. #### msa-poller
A "shell script entry point" service which polls the pinger in the via `/` in the msa-api every 1 sec.

---
#### Running in K8s
Stay tuned form k8s-101 & k8s 102 workshops

#### Running the stack in `docker` or `docker swarm` ?
* docker -> `docker-compose up -d`
* swarm -> `docker stack deploy --compose-file docker-compose.yml demostack`
