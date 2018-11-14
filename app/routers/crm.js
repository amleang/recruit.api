module.exports = app => {
    app.router.get("/api/crm/wvisit", app.controller.crm.wvisit);
    app.router.get("/api/crm/wvisititem/:id", app.controller.crm.wvisititem);
    app.router.post("/api/crm/invalid/:id", app.controller.crm.invalid);
    app.router.post("/api/crm/setvisit", app.controller.crm.setvisit);

    app.router.get("/api/crm/enrolllist", app.controller.crm.enrolllist);
    app.router.post("/api/crm/setenroll", app.controller.crm.setenroll);

    app.router.get("/api/crm/wcashbackitem/:id", app.controller.crm.wcashbackitem);
    app.router.get("/api/crm/recommend", app.controller.crm.recommend);
    app.router.post("/api/crm/setrecommend", app.controller.crm.setrecommend);

}