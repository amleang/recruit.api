const _ = require('lodash');
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

module.exports = {
    whereObject,
    sqlWhereCount
}