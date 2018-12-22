module.exports = app => {
    app.router.get("/api/home/report", app.controller.home.report);
    app.router.get("/api/home/systime",app.controller.home.systime);
    app.router.get("/api/home/getmsg",app.controller.home.getmsg);
}