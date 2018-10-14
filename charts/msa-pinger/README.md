## MSA-PINGER app

Intended to increment value saved in redis via `msa-api` service.
Based on image with simple bash script which receives MSA-API URI and call specific `ping` api to increment the value.

This app has no dependencies and has basic liveness based health check, see [templates/deployment.yaml](templates/deployment.yaml) for details.
