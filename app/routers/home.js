module.exports = app => {
    app.router.get("/api/home/report", app.controller.home.report);
}