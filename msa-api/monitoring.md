# Monitoring with prom-client liberery

## Custom 'generic' metrics

### A counter showing the total number of http requests

```text
# HELP http_requests_total Number of requests made
# TYPE http_requests_total counter
http_requests_total{method="GET"} 2
```

### A counter showing the number of paths (used by summary later on)

```text
# HELP pathsTaken Paths taken in the app
# TYPE pathsTaken counter
pathsTaken{path="/"} 1
pathsTaken{path="/pinger"} 1
```

### A summary showing the reponse time epr path and per method

```text
# HELP
responses Response time in millis
# HELP pathsTaken Paths taken in the app
# TYPE responses summary
responses{quantile="0.01",method="GET",path="/",status="304"} 4.32602
responses{quantile="0.05",method="GET",path="/",status="304"} 4.32602
responses{quantile="0.5",method="GET",path="/",status="304"} 4.32602
responses{quantile="0.9",method="GET",path="/",status="304"} 4.32602
responses{quantile="0.95",method="GET",path="/",status="304"} 4.32602
responses{quantile="0.99",method="GET",path="/",status="304"} 4.32602
responses{quantile="0.999",method="GET",path="/",status="304"} 4.32602
responses_sum{method="GET",path="/",status="304"} 4.32602
responses_count{method="GET",path="/",status="304"} 1
responses{quantile="0.01",method="GET",path="/pinger",status="200"} 0.6097389999999999
responses{quantile="0.05",method="GET",path="/pinger",status="200"} 0.6097389999999999
responses{quantile="0.5",method="GET",path="/pinger",status="200"} 0.6097389999999999
responses{quantile="0.9",method="GET",path="/pinger",status="200"} 0.6097389999999999
responses{quantile="0.95",method="GET",path="/pinger",status="200"} 0.6097389999999999
responses{quantile="0.99",method="GET",path="/pinger",status="200"} 0.6097389999999999
responses{quantile="0.999",method="GET",path="/pinger",status="200"} 0.6097389999999999
responses_sum{method="GET",path="/pinger",status="200"} 0.6097389999999999
responses_count{method="GET",path="/pinger",status="200"} 1
```

This is a good starting point ...
