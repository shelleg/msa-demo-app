let express = require('express');
let redis = require('redis');
let app = express();
var config = require('config');

// configuration related
process.env.NODE_ENV || 'development'
var app_listen_port = process.env.LISTEN_PORT || 8080;

if (config.has('redis_url')) {
  var cache_host = config.redis_url;
  console.log('NODE_CONFIG_DIR: ' + config.util.getEnv('NODE_CONFIG_DIR'));
  console.log('redis_url loaded for ' + config.util.getEnv('NODE_ENV') + ' environment');
}

if (process.env.REDIS_URL != null) {
  var cache_host = process.env.REDIS_URL;
}

app.set('redis', redis.createClient({
  url: cache_host
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

app.listen(app_listen_port, function () {
  console.log('running on host ' + config.util.getEnv('HOSTNAME'));
  console.log('Server running on port ' + app_listen_port + '!');
});
