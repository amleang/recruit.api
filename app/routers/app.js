module.exports = app => {
    app.router.get("/api/app/recruit", app.controller.app.recruit);
    app.router.get("/api/app/recommend", app.controller.app.recommend);
    app.router.get("/api/app/recruititem", app.controller.app.recruititem);
    app.router.get("/api/app/co", app.controller.app.co);
    /**纠错 */
    app.router.post("/api/app/correction", app.controller.app.correction);
    /**报名 */
    app.router.post("/api/app/enroll", app.controller.app.enroll);
    /**关注 */
    app.router.post("/api/app/attention", app.controller.app.attention);
    /**取消关注 */
    app.router.post("/api/app/attentiondel", app.controller.app.attentiondel);
    /**关注列表 */
    app.router.get("/api/app/attentionlist", app.controller.app.attentionlist)
}