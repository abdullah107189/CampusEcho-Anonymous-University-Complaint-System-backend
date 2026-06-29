import app from './app'; 
import { config } from './config/config';
import { logger } from './utils/logger';

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server started on port ${PORT} | ENV: ${config.nodeEnv}`);
});