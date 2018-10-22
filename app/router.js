'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  require('./routers/user')(app);
  require('./routers/enterprise')(app);
  require('./routers/company')(app);
  require('./routers/recruit')(app);
  const { router, controller } = app;
  router.post("/api/upload", controller.upload.upload);

};