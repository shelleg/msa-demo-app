let express = require('express');
let redis = require('redis');
let app = express();

app.set('redis', redis.createClient({
  url: process.env.REDIS_URL
}));

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

app.listen(8080, function () {
	console.log('Server running on port 8080!');
});
