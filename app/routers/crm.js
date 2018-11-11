module.exports = app => {
    app.router.get("/api/crm/wvisit", app.controller.crm.wvisit);
}