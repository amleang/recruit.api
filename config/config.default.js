'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1537494664130_6476';
  config.cluster ={
    listen: {
      port: 7001,
      hostname: '192.168.0.129',
      /* hostname:"127.0.0.1" */
      // path: '/var/run/egg.sock',
    }
  }
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
      host: '47.94.108.191',
      //host:"127.0.0.1",
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
    fileSize: '20mb'
  }
  return config;
};