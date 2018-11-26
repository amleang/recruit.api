module.exports = app => {
    app.router.get("/api/app/recruit", app.controller.app.recruit);
    app.router.get("/api/app/recommendlist", app.controller.app.recommendlist);
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
    app.router.get("/api/app/attentionlist", app.controller.app.attentionlist);
    /**立即推荐 */
    app.router.post("/api/app/recommend", app.controller.app.recommend);
    /**余额 */
    app.router.get("/api/app/balance", app.controller.app.balance);
    /**余额列表 */
    app.router.get("/api/app/balancelist", app.controller.app.balancelist);
    /**我的补贴 */
    app.router.get("/api/app/cashbacklist", app.controller.app.cashbacklist);
    /**我的工作 */
    app.router.get("/api/app/worklist",app.controller.app.worklist);
    /**查看排名 */
    app.router.get("/api/app/ranking",app.controller.app.ranking);
    /**我的推荐 */
    app.router.get("/api/app/myrecommend",app.controller.app.myrecommend);
    /**发送短信验证码 */
    app.router.post("/api/app/sendsms",app.controller.app.sendSMS);
    /**修改手机号 */
    app.router.post("/api/app/updatephone",app.controller.app.updatePhone);
    /*** 用户个人信息*/
    app.router.get("/api/app/myinfo",app.controller.app.myinfo);
    /**修改个人信息 */
    app.router.post("/api/app/setuserinfo",app.controller.app.setuserinfo);
}