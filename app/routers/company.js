module.exports = app => {
    app.router.get("/api/co/", app.controller.company.list);
    app.router.post("/api/co", app.controller.company.insert);
    app.router.put("/api/co", app.controller.company.update);
}