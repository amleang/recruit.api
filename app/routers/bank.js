module.exports = app => {
    app.router.post("/api/bank", app.controller.bank.insert);
    app.router.put("/api/bank", app.controller.bank.update);
    app.router.get("/api/bank/:id", app.controller.bank.item);
}