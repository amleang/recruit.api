'use strict';
const Controller = require('egg').Controller;
const tip = require("../lib/tip")
const {
    cookiesValid,
    whereObject,
    sqlWhereCount,
    sqlWhere,
} = require("../lib/utils")

class HomeController extends Controller {
    /**
     * 首页报表数据
     */
    async report() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        //注册会员数
        const resCount1 = await this.app.mysql.query("select count(*) as count from wxuser where `status`=1");
        //未注册会员数
        const resCount2 = await this.app.mysql.query("select count(*) as count from wxuser where `status`=0");
        //招工开启
        const resCount3 = await this.app.mysql.query("select count(*) as count from recruit where active=1");
        //招工关闭
        const resCount4 = await this.app.mysql.query("select count(*) as count from recruit where active=0");
        //报名数
        const resCount5 = await this.app.mysql.query("select count(*) as count from enroll");
        var datetime = new Date();
        var endTime = datetime.getFullYear() + "-" + (datetime.getMonth() + 1) + "-" + datetime.getDate() + " 23:59:59";
        var startdate = new Date(datetime - 7 * 24 * 60 * 60 * 1000);
        var startTime = startdate.getFullYear() + "-" + (startdate.getMonth() + 1) + "-" + startdate.getDate() + " 00:00:00";
        //最近一周获取会员数
        var sqlwxuser = "SELECT * from (";
        sqlwxuser += "select DATE_FORMAT(createAt,'%Y-%m-%d') as createAt ,COUNT(1) as count from wxuser  where createAt>='" + startTime + "' and createAt<='" + endTime + "' GROUP BY DATE_FORMAT(createAt,'%Y-%m-%d')"
        sqlwxuser += ") as t ORDER BY createAt ASC";
        const wxuserRes = await this.app.mysql.query(sqlwxuser);
        //最近一周注册数
        var sqlwxuserreg = "SELECT * from (";
        sqlwxuserreg += "select DATE_FORMAT(updateAt,'%Y-%m-%d') as createAt ,COUNT(1) as count from wxuser  where status=1 and updateAt>='" + startTime + "' and updateAt<='" + endTime + "' GROUP BY DATE_FORMAT(updateAt,'%Y-%m-%d')"
        sqlwxuserreg += ") as t ORDER BY createAt ASC";
        const wxuserregRes = await this.app.mysql.query(sqlwxuserreg);
        //最近一周招工
        var sqrecruit = "SELECT * from (";
        sqrecruit += "select DATE_FORMAT(createAt,'%Y-%m-%d') as createAt ,COUNT(1) as count  from recruit  where createAt>='" + startTime + "' and createAt<='" + endTime + "' GROUP BY DATE_FORMAT(createAt,'%Y-%m-%d')"
        sqrecruit += ") as t ORDER BY createAt ASC";
        const recruitRes = await this.app.mysql.query(sqrecruit);
        //最近一周报名数
        var sqlenroll = "SELECT * from (";
        sqlenroll += "select DATE_FORMAT(createAt,'%Y-%m-%d') as createAt ,COUNT(1) as count  from enroll  where createAt>='" + startTime + "' and createAt<='" + endTime + "' GROUP BY DATE_FORMAT(createAt,'%Y-%m-%d')"
        sqlenroll += ") as t ORDER BY createAt ASC";
        const enrollRes = await this.app.mysql.query(sqlenroll);
        var data = {
            usercount: resCount1[0].count,
            userregcount: resCount2[0].count,
            recruitocount: resCount3[0].count,
            recruitccount: resCount4[0].count,
            enrollcount: resCount5[0].count,
            userlist: wxuserRes,
            userreglist: wxuserregRes,
            recuritlist: recruitRes,
            enrolllist: enrollRes
        }
        ctx.body = {
            ...tip[200],
            data: data
        };
    }
    /**
     * 获取系统时间
     */
    async systime() {
        const ctx = this.ctx;
        const result = await this.app.mysql.query("select sysdate() as time");
        ctx.body = {
            ...tip[200],
            data: result[0].time
        }
    }
    /**
     * 根据时间获取是否有新的报名信息
     */
    async getmsg() {
        const ctx = this.ctx;
        const time = ctx.query.time;
        const resultcount = await this.app.mysql.query("select count(*) as count from enroll where createAt>?", [time]);
        const count = resultcount[0].count;
        if (count > 0) {
            const result = await this.app.mysql.query("select * from v_enroll where createAt>? order by createAt desc LIMIT 0,1", [time]);
            ctx.body = {
                ...tip[200],
                count: count,
                data: result[0]
            }
        }
        else {
            ctx.body = {
                ...tip[200],
                count: count
            }
        }
    }
}

module.exports = HomeController;
