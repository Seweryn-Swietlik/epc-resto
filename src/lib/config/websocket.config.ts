export default {
  connectionUrl:
    process.env.WEBSOCKET_REDIS_HOST && process.env.WEBSOCKET_REDIS_PORT
      ? `redis://${process.env.WEBSOCKET_REDIS_HOST}:${process.env.WEBSOCKET_REDIS_PORT}`
      : 'redis://localhost:6379',
};
