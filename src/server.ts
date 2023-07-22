import { Server } from 'http';
import app from './app';
import config from './config/convict.config';
import connectDB from '@config/mongo.config';
import log from '@config/logger.config';

const PORT = config.get('port');
const HOST = config.get('host');
const DB_URI = config.get('mongodbUri');

const startServer = async () => {
  await connectDB(DB_URI);
  return app.listen(PORT, () =>
    log.info(`
  ################################################
  服务器本地地址 http://127.0.0.1:${PORT} 
  ################################################
  Server's running at http://${HOST}:${PORT} 
  ################################################
  `),
  );
};

let server: Server;

/*
 * -------- Starting Server -------
 */
startServer()
  .then((serve) => {
    server = serve;
  })
  .catch((error) => {
    log.error(`Server failed to start: ${error}`);
    process.exit(1);
  });

/*
 * -------- For unhandled promise rejections -------
 */
process.on('unhandledRejection', (err: any) => {
  log.info(`${err.name} \n ${err.message}`);
  log.error('Unhandled rejection 💥 shutting down....');
  server.close(() => {
    process.exit(1);
  });
});

/*
 * -------- Handling uncaught exceptions -------
 */
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection 💥 shutting down....');

  process.exit(1);
});

/*
 * -------- Handling SIGTERM -------
 */
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
