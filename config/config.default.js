'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1537494664130_6476';
  config.security = {
    csrf: {
      enable: false,
    },
    xframe: {
      enable: false,
    },
  };
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };
  // add your config here
  config.middleware = [];
  config.mysql = {
    client: {
      // host
      host: '118.25.98.91',
      // 端口号
      port: '3306',
      // 用户名
      user: 'zal',
      // 密码
      password: 'Zal@19890107',
      // 数据库名
      database: 'recruit',
    },
  }
  config.multipart = {
    fileSize: '2mb'
  }
  return config;
};