'use strict';
const Controller = require('egg').Controller;
const svgCaptcha = require('svg-captcha');
const md5 = require('md5');
const tip = require("../lib/tip")
class UserController extends Controller {
    /**
     * 用户登录
     */
    async login() {
        const query = this.ctx.query;
        if (this.ctx.session.capthcha.toLocaleLowerCase() == query.captcha.toLocaleLowerCase()) {
            const results = await this.app.mysql.select('user', {
                where: {
                    username: query.username,
                    userpwd: md5(query.pwd)
                }
            });
            if (results.length > 0) {
                if (results[0].active != 1) {
                    this.ctx.body = { ...tip[1002]
                    }
                } else {
                    this.ctx.cookies.set("recrit-ck", JSON.stringify(results[0]), {
                        maxAge: 4 * 1000 * 60 * 60,
                        httpOnly: true, // 默认就是 true
                        encrypt: true, // 加密传输
                    })
                    this.ctx.body = { ...tip[200],
                        docs: results[0]
                    }
                }
            } else {
                this.ctx.body = { ...tip[1001]
                }
            }
        } else {
            this.ctx.body = { ...tip[1006]
            }
        }
    }
    /**
     * 验证码
     */
    async captcha() {
        let captcha = await svgCaptcha.create();

        this.ctx.session.capthcha = captcha.text;
        this.ctx.type = 'svg';
        this.ctx.body = captcha.data;
    }
    /**
     * 获取列表
     */
    async list() {
        const ctx = this.ctx;
        const params = ctx.query;
        params.pageNo = params.pageNo || 1;
        params.pageSize = params.pageSize || 10;
        let offset = (params.pageNo - 1) * params.pageSize;
        const results = await.this.app.mysql.select("user", {
            where: {},
            columns: [],
            orders: [
                ['createAt', 'desc']
            ],
            limit: params.pageSize,
            offset: offset
        })
    }
    /**
     * 获取单条
     */
    async item() {

    }
    /**
     * 插入
     */
    async inset() {
        const ctx = this.ctx;
        const form = ctx.request.body;
        const result = await this.app.mysql.insert("user", form);
    }
    /**
     * 修改
     */
    async update() {

    }
}
module.exports = UserController;