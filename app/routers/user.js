module.exports = app => {
    app.router.get("/api/user/login", app.controller.user.login);
    app.router.get("/api/user/captcha", app.controller.user.captcha);
    app.router.get("/api/user", app.controller.user.list);
    app.router.get("/api/user:id", app.controller.user.item);
    app.router.post("/api/user", app.controller.user.inset);
    app.router.put("/api/user", app.controller.user.update);
}