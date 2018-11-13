module.exports = app => {
    app.router.get("/api/cashback", app.controller.cashback.list);
    app.router.post("/api/cashback", app.controller.cashback.inset);
    app.router.delete("/api/cashback/:id", app.controller.cashback.del);
}