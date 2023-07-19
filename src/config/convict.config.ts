import convict from 'convict';

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8000,
    env: 'PORT',
    arg: 'port',
  },
  host: {
    doc: 'The host address to bind.',
    format: 'port',
    default: '0.0.0.0:8000',
    env: 'HOST',
    arg: 'host',
  },
  mongodbUri: {
    doc: 'The MongoDB connection URI.',
    format: "url",
    default: 'mongodb://localhost:27017/my-database',
    env: 'MONGODB_URI',
    arg: 'mongodb-uri',
  },
});

config.validate({ allowed: 'strict' });

export default config;
