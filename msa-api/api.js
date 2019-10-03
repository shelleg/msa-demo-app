const express = require('express');
const redis = require('redis');
const app = express();
const config = require('./config/config.js');

const redis_pass = config.get('redis_pass')
const cache_host = process.env.REDIS_URL ? process.env.REDIS_URL :  'redis://' + config.get('redis_host') + ':' + config.get('redis_port');

app.set('redis', redis.createClient({
  url: cache_host,
  password: redis_pass
}));

// routes
app.get('/', (req, res) => {
  const client = app.get('redis');

  client.get('pings', (err, result) => {
    if(err) {
      res.status(500).send(err);
    } else {
      res.send("Current ping count: " + result + "\n");
    }
  });
});

app.get('/pinger', (req, res) => {
  const client = app.get('redis');

  client.incrby('pings', "1", (err, result) => {
    if(err) {
      res.status(500).send(err);
    } else {
      res.send('Ping + 1')
      res.status(204).end();
    }
  });
});

app.post('/ping', (req, res) => {
  const client = app.get('redis');

  client.incrby('pings', "1", (err, result) => {
    if(err) {
      res.status(500).send(err);
    } else {
      res.status(204).end();
    }
  });
});

app.get('/isAlive', (req, res) => {
  res.send('It\'s aaaalive!\n')
})

app.get('/probe/liveness', (req, res) => {
  res.status(200).send("OK\n");
});

app.get('/probe/readiness', (req, res) => {
  const client = app.get('redis');

  client.ping((err, result) => {
    if(err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("OK\n");
    }
  });
});

app.listen(config.get('listen_port'), () => {
  console.log('Connecting to cache_host: ' + cache_host);
  console.log('Server running on port ' + config.get('listen_port') + '!');
});
