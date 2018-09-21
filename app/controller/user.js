'use strict';
const Controller = require('egg').Controller;
class UserController extends Controller {
    async login() {
        this.ctx.cookies.set("recrit-ck", "adfdadfsfsadfsdfsadf", {
            maxAge: 4 * 1000 * 60 * 60,
            httpOnly: true, // 默认就是 true
            encrypt: true, // 加密传输
        });
        console.log("cookies=>", this.ctx.cookies.get("recrit-ck"), {
            signed: false,
        });
        console.log("res=>", this.ctx.query);
        this.ctx.body = {
            code: 200,
            data: {
                token: 123456
            }
        };
    }
}
module.exports = UserController;