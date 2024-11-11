export default {
  frontUrl: process.env.FRONT_URL
    ? process.env.FRONT_URL.split(',')
    : ['http://localhost:3000'],
  port: +(process.env.PORT || 3000),
  env: process.env.NODE_ENV || 'development',
};
