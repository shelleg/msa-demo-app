## MSA-POLLER app

Intended to read the value from redis through msa-api, so we will verify that is was incremented.
Based on image with simple bash script which receives MSA-API URI and call specific `polling` api to read the value.

This app has no dependencies and has basic liveness based health check, see [templates/deployment.yaml](templates/deployment.yaml) for details.
