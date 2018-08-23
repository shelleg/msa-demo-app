var convict = require('convict');

// Define a schema
var config = convict({
  env: {
    doc: "The application environment.",
    format: ["development", "docker", "kubernetes"],
    default: "development",
    env: "NODE_ENV"
  },
  listen_port: {
    doc: "The application listen port",
    format: "port",
    default: "8080",
    env: "LISTEN_PORT"
  },
  redis_host: {
    doc: "The IP address redis is listening on",
    default: "127.0.0.1",
    env: "REDIS_SERVICE_HOST",
  },
  redis_pass: {
    doc: "The IP address redis is listening on",
    default: "MyS3cr3t",
    env: "REDIS_SERVICE_PASSWORD",
  },
  redis_port: {
    doc: "The IP address redis is listening on",
    format: "port",
    default: "6379",
    env: "REDIS_SERVICE_PORT",
  }
});

// Load environment dependent configuration
var env = config.get('env');
config.loadFile('./config/' + env + '.json');
console.log('loading ./config/' + env + '.json');
// config.has('redis_host') && console.log('will attemtp to load redis_host from ./config/' + env + '.json')
// Perform validation
config.validate({allowed: 'strict'});

module.exports = config;
