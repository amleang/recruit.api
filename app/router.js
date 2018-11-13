'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  require('./routers/user')(app);
  require('./routers/enterprise')(app);
  require('./routers/company')(app);
  require('./routers/recruit')(app);
  require('./routers/app')(app);
  require('./routers/bank')(app);
  require("./routers/crm")(app);
  require("./routers/cashback")(app);
  const { router, controller } = app;
  router.post("/api/upload", controller.upload.upload);
  /**纠错 */
  router.get("/api/correction", controller.recruit.correction);
  router.get("/api/correction/:id", controller.recruit.correctionitem)

};