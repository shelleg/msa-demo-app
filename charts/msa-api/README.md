## MSA-APP API for Redis (DAL style)

This application acts like a DAL (Data Access Layer) for Redis, it provides basic "publish/retriever" API for REDIS (deployed as dependent chart).
Beside "business" API it provides "health check" API:
* ___/isAlive___ - returns `200 OK` HTTP status and `"OK"` string
* ___/probe/liveness___ - returns 200 OK
* ___/prove/readiness___ - returns 200 OK

This service has a dependency - redis chart which is taken from "stable" redis charts repository during buld process.
So we have no redis chart to manage, we will rely on Bitnami to provide us a good chart.

Our [values.yaml](values.yaml) contains the relevant info to provide to dependent chart upon deployment.

In this constallation, I've changed `config` approach used for this app, I'm not relying on predefined config files (which would require image rebuild since config structure will be changed). I'm replacing it with `ConfuigMap` template which can be managed dynamically without image rebuild.
This ConfuigMap will be mounted as a config file during deployment in K8S.

## Limitations
Since no "connection timeouts + retries" implemented in code, K8S healthchecks will restart the container when the service is not healthy.
Actually, msa-api app tries to connect on start to redis, if redis is not available - it hangs.... no retries there....
Further dev effort required - TBD.

## Enhancements
Docker image is build in 2 stages:
* __Basic image__ - OS + nmp packages
* __App code__
* __Dynamic config file__ - we can control it's content from values.yaml, thus we will be able to distinguish between different deployment types (stage, lab, etc.)
Ap code was changed to have `config.js` next to other code values (instead of config folder).

Thus, we have layered image which chages app layer only (well, base image will have less updates....)
