const { createLogger, format, transports } = require('winston');
const path = require('path');

const logDir = 'logs';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: path.join(__dirname,'..','..',logDir, 'combined.log') }),
    new transports.File({ filename: path.join(__dirname,'..','..',logDir, 'error.log'), level: 'error' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    })
  );
}

module.exports = logger;
