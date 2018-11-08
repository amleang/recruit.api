module.exports = app => {
    app.router.get("/api/app/recruit", app.controller.app.recruit);
    app.router.get("/api/app/recommend", app.controller.app.recommend);
    app.router.get("/api/app/recruititem", app.controller.app.recruititem);
    app.router.get("/api/app/co", app.controller.app.co);

    app.router.post("/api/app/correction",app.controller.app.correction);
}