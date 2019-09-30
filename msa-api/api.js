const express = require('express');
const redis   = require('redis');
const app     = express();

// redis related
var   config  = require('./config/config.js');
var   cache_host = 'redis://' + config.get('redis_host') + ':' + config.get('redis_port');
var   redis_pass = config.get('redis_pass')

// prometheus client
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;

var Prometheus = require('./prom');  

// instantiate counters
app.use(Prometheus.requestCounters);  
app.use(Prometheus.responseCounters);

// create /metrics
Prometheus.injectMetricsRoute(app);

// start collection
Prometheus.startCollection();  


if (process.env.REDIS_URL != null) {
  var cache_host = process.env.REDIS_URL;
}

app.set('redis', redis.createClient({
  url: cache_host,
  password: redis_pass
}));

// routes
app.get('/', function (req, res) {
  let client = app.get('redis');

  client.get('pings', function(err, result) {
    if(err) {
      res.status(500).send(err);
    } else {
      res.send("Current ping count: " + result + "\n");
    }
  });
});

app.get('/pinger', function (req, res) {
  let client = app.get('redis');

  client.incrby('pings', "1", function(err, result) {
    if(err) {
      res.status(500).send(err);
    } else {
      res.send('Ping + 1')
      res.status(204).end();
    }
  });
});

// increase pings collection by 1
app.post('/ping', function (req, res) {
  let client = app.get('redis');

  client.incrby('pings', "1", function(err, result) {
    if(err) {
      res.status(500).send(err);
    } else {
      res.status(204).end();
    }
  });
});

// Liverness and Resiness probes for k8s

app.get('/isAlive', function (req, res) {
  res.send('It\'s aaaalive!\n')
})

app.get('/probe/liveness', function (req, res) {
  res.status(200).send("OK\n");
});

app.get('/probe/readiness', function (req, res) {
  let client = app.get('redis');

  client.ping(function(err, result) {
    if(err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("OK\n");
    }
  });
});


// Start server
app.listen(config.get('listen_port'), function () {
  console.log('Connecting to cache_host: ' + cache_host);
  console.log('Server running on port ' + config.get('listen_port') + '!');
});
