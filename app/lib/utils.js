const _ = require('lodash');
/**
 * 验证登录是否失效
 * @param {*} ctx 
 */
const cookiesValid = function (ctx) {
    let res = true;
    let cookies = ctx.cookies.get("recrit-ck");
    if (!cookies) {
        ctx.body = {
            code: 1003,
            msg: '登录失效,请重新登录'
        }
        res = false;
    }
    return res;
}

/**
 * where 条件
 * @param {} where 
 */
const whereObject = function (where) {
    const clumns = _.assign({}, where);
    delete clumns.page;
    delete clumns.size;
    return clumns;
}
const sqlWhere = function (tableName, where, orderby, limit) {
    let sql = " select * from " + tableName;
    let keys = Object.keys(where);
    if (keys.length > 0) {
        let whereStr = "";
        keys.forEach(key => {
            if (whereStr == "")
                whereStr += key += " like '%" + where[key] + "%'";
            else
                whereStr += " and " + key + " like '%" + where[key] + "%'";
        });
        sql += " where " + whereStr;
    }
    if (orderby.length > 0) {
        let orderbyArr = [];
        orderby.forEach(item => {
            orderbyArr.push(item.join(' '));
        })
        let orderbyStr = orderbyArr.join(',');
        sql += " order by " + orderbyStr;
    }
    sql += " limit " + limit[0] + "," + limit[1];
    return sql;
}
/**
 * where 条件转SQL
 * @param {*} tableName 
 * @param {*} clumns 
 */
const sqlWhereCount = function (tableName, clumns) {
    let keys = Object.keys(clumns);
    let whereStr = "";
    keys.forEach(key => {
        if (whereStr != "") {
            if (clumns[key])
                whereStr += " AND " + key + "='" + clumns[key] + "'"
        } else {
            if (clumns[key])
                whereStr = key + "='" + clumns[key] + "'"
        }

    })
    let countSql = "select count(*) as count from " + tableName;
    if (whereStr != "")
        countSql += " Where " + whereStr;
    return countSql;
}

const intercept = function (that) {
    if (that.app.isClose=="true") {
        that.ctx.body = {
            code: 0,
            msg: "接口已经停用"
        };
        return false
    }
    return true;
}
module.exports = {
    cookiesValid,
    whereObject,
    sqlWhereCount,
    sqlWhere,
    intercept
}