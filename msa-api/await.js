let redis = require('redis');
let retry = require('retry')

// NOTE: it seems redis client does not trigger error callbacks when
// DNS look fails. This is a bug for sure.
process.on('uncaughtException', function(event) {
  console.log(event);
  console.log('connection failed');
  process.exit(1);
});

function ping(callback) {
  let operation = retry.operation({
    retries: process.env.ATTEMPTS ? parseInt(process.env.ATTEMPTS) : 60,
    factor: 1,
    randomize: false
  });

  operation.attempt(function(currentAttempt) {
    try {
      var client = redis.createClient({
        url: process.env.REDIS_URL
      });

      client.ping(function(err, result) {
        if(operation.retry(err)) {
          return;
        }

        callback(err ? operation.mainError() : null, result);
      });
    } catch(err) {
      if(operation.retry(err)) {
        return;
      } else {
        callback(err || operation.mainError());
      }
    }
  });
};

ping(function(err, result) {
  if(err) {
    console.log(err);
    console.log('Connection failed');
    process.exit(1);
  } else {
    console.log('Connection ok');
    process.exit(0);
  }
});
