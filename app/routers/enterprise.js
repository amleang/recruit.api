module.exports = app => {
    app.router.get("/api/ent/select", app.controller.enterprise.select);
    app.router.get("/api/ent", app.controller.enterprise.list);
    app.router.get("/api/ent/:id", app.controller.enterprise.item);
    app.router.post("/api/ent", app.controller.enterprise.insert);
    app.router.put("/api/ent", app.controller.enterprise.update);
}