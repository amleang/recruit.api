'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  require('./routers/user')(app);
  /* const { router, controller } = app;
  router.get('/', controller.home.index); */
 
};
