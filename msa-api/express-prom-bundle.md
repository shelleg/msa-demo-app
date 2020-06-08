# Adding custom metrics

```js
const promBundle = require("express-prom-bundle");

```

## The following adds both generig nodejs stats, and http stats based on path and method + add the app_version dimention

* `includeMethod: true` e.g POST GET PUT etc,
* `ncludePath: true` e.g /pinger
* `customLabels: {app_version: process.env.npm_package_version}` our own app version is now part of each metric ...
* `promClient: {collectDefaultMetrics: {timeout: 1000}},` adds the nodjs generic metrics

```js
// enable prometheus stats
const metricsMiddleware = promBundle({ includeMethod: true, 
                                       includePath: true, 
                                       customLabels: {app_version: process.env.npm_package_version},
                                       promClient: {
                                          collectDefaultMetrics: {timeout: 1000}
                                        },
                                    });
// add metrics to express app
app.use(metricsMiddleware);

```

# Using thes metrics

* `up` is easy 1 app is up 0 app is down ...
* `http_request_duration_seconds_sum` a histogram

```text
# HELP http_request_duration_seconds duration histogram of http responses labeled with: status_code, method, path, app_version
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.003",status_code="404",method="GET",path="/probe/readiness",app_version="1.0.0"} 0
http_request_duration_seconds_bucket{le="0.03",status_code="404",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.1",status_code="404",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.3",status_code="404",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="1.5",status_code="404",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="10",status_code="404",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="+Inf",status_code="404",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_sum{status_code="404",method="GET",path="/probe/readiness",app_version="1.0.0"} 0.003803294
http_request_duration_seconds_count{status_code="404",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.003",status_code="200",method="GET",path="/probe/readiness",app_version="1.0.0"} 0
http_request_duration_seconds_bucket{le="0.03",status_code="200",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.1",status_code="200",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.3",status_code="200",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="1.5",status_code="200",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="10",status_code="200",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="+Inf",status_code="200",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_sum{status_code="200",method="GET",path="/probe/readiness",app_version="1.0.0"} 0.003453799
http_request_duration_seconds_count{status_code="200",method="GET",path="/probe/readiness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.003",status_code="200",method="GET",path="/probe/liveness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.03",status_code="200",method="GET",path="/probe/liveness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.1",status_code="200",method="GET",path="/probe/liveness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.3",status_code="200",method="GET",path="/probe/liveness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="1.5",status_code="200",method="GET",path="/probe/liveness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="10",status_code="200",method="GET",path="/probe/liveness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="+Inf",status_code="200",method="GET",path="/probe/liveness",app_version="1.0.0"} 1
http_request_duration_seconds_sum{status_code="200",method="GET",path="/probe/liveness",app_version="1.0.0"} 0.000631836
http_request_duration_seconds_count{status_code="200",method="GET",path="/probe/liveness",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.003",status_code="200",method="GET",path="/isAlive",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.03",status_code="200",method="GET",path="/isAlive",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.1",status_code="200",method="GET",path="/isAlive",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="0.3",status_code="200",method="GET",path="/isAlive",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="1.5",status_code="200",method="GET",path="/isAlive",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="10",status_code="200",method="GET",path="/isAlive",app_version="1.0.0"} 1
http_request_duration_seconds_bucket{le="+Inf",status_code="200",method="GET",path="/isAlive",app_version="1.0.0"} 1
http_request_duration_seconds_sum{status_code="200",method="GET",path="/isAlive",app_version="1.0.0"} 0.000634711
http_request_duration_seconds_count{status_code="200",method="GET",path="/isAlive",app_version="1.0.0"} 1
```


