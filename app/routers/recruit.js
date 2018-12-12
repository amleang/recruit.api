module.exports = app => {
    app.router.get("/api/recruit", app.controller.recruit.list);
    app.router.get("/api/recruit/:id", app.controller.recruit.item);
    app.router.post("/api/recruit/active", app.controller.recruit.active);
    app.router.post("/api/recruit/status", app.controller.recruit.status);
    app.router.post("/api/recruit", app.controller.recruit.inset);
    app.router.put("/api/recruit", app.controller.recruit.update);



}