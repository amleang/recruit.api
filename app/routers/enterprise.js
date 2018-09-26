module.exports = app => {
    app.router.get("/api/ent/select", app.controller.enterprise.select);
}