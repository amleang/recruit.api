'use strict';
const tip = require("../lib/tip")
const sign = require('../lib/sign.js');
const {
  whereObject,
  sqlWhereCount,
  sqlWhere,
  intercept
} = require("../lib/utils")
const SMSClient = require('@alicloud/sms-sdk')
const axios = require("axios")
const Controller = require('egg').Controller;

class AppController extends Controller {
  /**
   * 获取首页recruit列表
   */
  async recruit() {

    const ctx = this.ctx;
    const params = ctx.query;
    if (!intercept(this))
      return;
    params.page = params.page || 1;
    params.size = params.size || 10;
    params.status = 1;
    let offset = (params.page - 1) * params.size;
    const where = whereObject(params);
    const countWhere = sqlWhereCount("recruit", where);
    const count = await this.app.mysql.query(countWhere);
    const sql = sqlWhere("recruit", where, [['active', 'desc'], ["isTop", "desc"], ["weight", "desc"]], [offset, params.size]);
    const results = await this.app.mysql.query(sql);
    ctx.body = {
      ...tip[200],
      data: results,
      count: count[0].count
    };
  }
  /**
   * 推荐recruit列表 6条
   */
  async recommendlist() {
    const ctx = this.ctx;
    const params = ctx.query;
    params.page = 1;
    params.size = 6;
    let offset = (params.page - 1) * params.size;
    const where = whereObject(params);
    const countWhere = sqlWhereCount("recruit", where);
    const count = await this.app.mysql.query(countWhere);
    const sql = sqlWhere("recruit", where, [['active', 'desc'], ["isTop", "desc"]], [offset, params.size]);
    const results = await this.app.mysql.query(sql);
    ctx.body = {
      ...tip[200],
      data: results,
      count: count[0].count
    };
  }
  /**
   * 获取 recruit 单条信息
   */
  async recruititem() {
    const ctx = this.ctx;
    if (!intercept(this))
      return;
    const id = ctx.query.id;
    const form = await this.app.mysql.get("recruit", {
      id: id
    });
    const unionid = ctx.query.unionid;
    let att = 0;
    if (unionid) {
      /**是否关注 */
      const attresult = await this.app.mysql.query("select count(*) as count from attention where unionid=? and recruitid=?", [unionid, id]);
      if (attresult[0].count > 0)
        att = 1;
    }
    /**获取报名人数 */
    const enrollresult = await this.app.mysql.query(" select COUNT(*) as count from enroll where recruitid=? ", [id]);
    form.signupCount = enrollresult[0].count;
    const result = await this.app.mysql.select("subsidy",
      {
        where: { recruitId: id },
        orders: [['sort', 'asc']],
        limit: 100000, // 返回数据量
        offset: 0, // 数据偏移量
      }
    );
    form.imgs = form.imgs.split(',');
    form.subsidys = [];
    form.att = att;
    //获取补贴
    for (var i = 0; i < result.length; i++) {
      form.subsidys.push({ value: result[i].describe });
    }
    this.ctx.body = {
      ...tip[200],
      data: form
    };
  }
  /**
   * 纠错信息
   */
  async correction() {
    debugger
    const ctx = this.ctx;
    const form = ctx.request.body;
    if (!form.imgs)
      form.imgs = [];
    if (form.imgs.length > 0)
      form.imgs = form.imgs.join(',');
    else
      form.imgs = "";
    form.createAt = this.app.mysql.literals.now;
    const result = await this.app.mysql.insert("correction", form);
    if (result.affectedRows > 0) {
      ctx.body = {
        ...tip[200]
      };
    } else {
      ctx.body = {
        ...tip[2002]
      };
    }
  }
  /**
   * 获取公司信息
   */
  async co() {
    const ctx = this.ctx;
    const results = await this.app.mysql.select("company");
    if (results.length > 0) {
      const links = await this.app.mysql.select("links");
      results[0].links = links;
    }
    ctx.body = {
      ...tip[200],
      data: results
    };
  }
  /**
   * 免费报名
   */
  async enroll() {
    const ctx = this.ctx;
    if (!intercept(this))
      return;
    const form = ctx.request.body;
    form.status = 0;
    let isFlag = true;
    /*     if (form.inviterCode) {
          //判断是否存在
          const count = await this.app.mysql.query("select count(*) as count from user where invitationCode='" + form.inviterCode + "'");
          if (count.count == 0) {
            isFlag = false;
            ctx.body = {
              code: 101,
              msg: "您填写的邀请码不存在"
            }
          }
        } */
    if (isFlag) {
      form.createAt = this.app.mysql.literals.now;
      const result = await this.app.mysql.insert("enroll", form);
      if (result.affectedRows > 0) {
        const enrollresult = await this.app.mysql.query(" select COUNT(*) as count from enroll where recruitid=? ", [form.recruitid]);
        ctx.body = {
          ...tip[200],
          count: enrollresult[0].count
        };
      } else {
        ctx.body = {
          ...tip[2002]
        };
      }
    }
  }

  /**
 * 关注
 */
  async attention() {
    debugger;
    const ctx = this.ctx;
    let form = ctx.request.body;
    const unionid = form.unionid;
    const recruitid = form.recruitid;
    const item = await this.app.mysql.get("attention", {
      unionid: unionid,
      recruitid: recruitid
    });

    if (item) {
      item.createAt = this.app.mysql.literals.now;
      const result = await this.app.mysql.update("attention", item);
      if (result.affectedRows > 0) {
        ctx.body = {
          ...tip[200]
        };
      } else {
        ctx.body = {
          ...tip[2003]
        };
      }
    }
    else {
      form.createAt = this.app.mysql.literals.now;
      const result = await this.app.mysql.insert("attention", form);

      if (result.affectedRows > 0) {
        ctx.body = {
          ...tip[200],
          id: result.insertId
        };
      } else {
        ctx.body = {
          ...tip[2002]
        };
      }
    }
  }
  /**
   * 取消关注
   */
  async attentiondel() {
    const ctx = this.ctx;
    const form = ctx.request.body;
    const unionid = form.unionid;
    const recruitid = form.recruitid;
    const result = await this.app.mysql.delete('attention', {
      unionid: unionid,
      recruitid: recruitid
    });
    if (result.affectedRows > 0) {
      ctx.body = {
        ...tip[200]
      };
    } else {
      ctx.body = {
        code: "1001",
        msg: "取消关注失败"
      };
    }
  }
  /**
   * 关注列表
   */
  async attentionlist() {
    const ctx = this.ctx;
    const params = ctx.query;
    params.page = params.page || 1;
    params.size = params.size || 1000000;
    let offset = (params.page - 1) * params.size;
    const where = whereObject(params);
    const sql = sqlWhere("v_attention", where, [['createAt', 'desc']], [offset, params.size]);
    const results = await this.app.mysql.query(sql);
    ctx.body = {
      ...tip[200],
      data: results
    };
  }
  /**
   * 立即推荐
   */
  async recommend() {
    const ctx = this.ctx;
    let form = ctx.request.body;
    form.createAt = this.app.mysql.literals.now;
    const result = await this.app.mysql.insert("recommend", form);
    if (result.affectedRows > 0) {
      ctx.body = {
        ...tip[200],
        id: result.insertId
      };
    } else {
      ctx.body = {
        ...tip[2002]
      };
    }

  }
  /**
   * 余额
   */
  async balance() {
    const ctx = this.ctx;
    let unionid = ctx.query.unionid;
    const result = await this.app.mysql.query("select SUM(price) as totalprice from v_cashbacklist where `status`=1 and unionid=?", [unionid]);
    const form = {
      totalprice: result[0].totalprice,
    }
    ctx.body = {
      ...tip[200],
      data: form
    };
  }
  /**
   * 查看余额明细
   */
  async balancelist() {
    const ctx = this.ctx;
    let unionid = ctx.query.unionid;
    const results = await this.app.mysql.query("select * from v_cashbacklist where `status`=1 and unionid=? order by updateAt asc", [unionid])

    ctx.body = {
      ...tip[200],
      data: results
    };
  }
  /**
   * 补贴记录
   */
  async cashbacklist() {
    const ctx = this.ctx;
    let unionid = ctx.query.unionid;
    const results = await this.app.mysql.query("select * from v_cashback where unionid=? order by createAt ASC", [unionid])

    ctx.body = {
      ...tip[200],
      data: results
    };
  }
  /**
   * 我的工作
   */
  async worklist() {
    debugger
    const ctx = this.ctx;
    let unionid = ctx.query.unionid;
    const results = await this.app.mysql.query("select * from v_work where unionid=? and `status` in(3,4) order by entryAt DESC", [unionid])
    ctx.body = {
      ...tip[200],
      data: results
    };
  }
  /**
   * 查看排名
   */
  async ranking() {
    debugger;
    const ctx = this.ctx;
    let unionid = ctx.query.unionid;
    const results = await this.app.mysql.query("select unionid,username1,count(1) as total from v_recommend where `status`=1 AND unionid=? GROUP BY unionid,username1", [unionid]);

    const results2 = await this.app.mysql.query("select * from(select unionid,username1,count(1) as total from v_recommend where `status`=1  GROUP BY unionid,username1) as t ORDER BY t.total desc LIMIT 0,10");
    const form = {
      mylist: results,
      list: results2
    }
    ctx.body = {
      ...tip[200],
      data: form
    };
  }

  /**
   * 我的推荐
   */
  async myrecommend() {
    const ctx = this.ctx;
    let unionid = ctx.query.unionid;
    const results = await this.app.mysql.query("select * from recommend where unionid=? order by createAt DESC", [unionid]);
    ctx.body = {
      ...tip[200],
      data: results
    }
  }

  /**
   * 短信发送
   */
  async sendSMS() {
    debugger
    // ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
    const accessKeyId = 'LTAIO4d9UtXP3nd4';
    const secretAccessKey = 'ZNjmhjQMJOCgNrP4i9PgNJhjetukM0';

    const ctx = this.ctx;
    let form = ctx.request.body;
    const unionid = form.unionid;
    const phone = form.phone;
    //设置动态验证码
    var code = await this.RndNum(4);
    var resid = await this.vcode(code, unionid, phone);
    debugger;
    while (resid == 0) {
      code = await this.RndNum(4);
      resid = this.vcode(code, unionid, phone);
    }


    //初始化sms_client
    let smsClient = new SMSClient({ accessKeyId, secretAccessKey });
    const that = this;
    //短信发送
    await smsClient.sendSMS({
      PhoneNumbers: phone,
      SignName: "苏州德聚仁合信息服务",
      TemplateCode: "SMS_151771937",
      TemplateParam: '{"code":"' + code + '"}'
    }).then(function (res) {
      debugger;
      if (res.Code == "OK") {
        //发送成功
        //修改验证码状态
        const uresult = that.app.mysql.query("update sendSms set status=1 where id=?", [resid]);
        ctx.body = {
          ...tip[200],
          data: code
        }
      }
      else {
        //发送失败
        ctx.body = {
          code: 0,
          msg: "验证码发送失败"
        }
      }
    }, function (err) {
      debugger
      //接口调用失败
      ctx.body = {
        code: 0,
        msg: "验证码接口调用失败"
      }
    })
  }
  /**
   * 修改用户手机号
   */
  async updatePhone() {
    debugger
    const ctx = this.ctx;
    let form = ctx.request.body;
    const unionid = form.unionid;
    const phone = form.phone;
    const code = form.code;
    //先判断code是否正确
    const count = await this.app.mysql.query("select count(*) count from sendSms where unionid=? and sendCode=? and phone=? and TIMESTAMPDIFF(MINUTE,createAt,NOW())<=5", [unionid, code, phone]);
    if (count[0].count > 0) {
      const results = await this.app.mysql.query("update sendSms set status=2 where unionid=? and sendCode=?", [unionid, code]);

      if (results.affectedRows > 0) {
        const userresult = await this.app.mysql.query("update wxuser set phone=? where unionid=?", [phone, unionid]);
        if (userresult.affectedRows > 0) {
          ctx.body = {
            ...tip[200],
            data: "ok"
          }
        }
        else {
          ctx.body = {
            code: 0,
            msg: "手机号修改失败！"
          }
        }
      }
      else {
        ctx.body = {
          code: 0,
          msg: "手机号修改失败！"
        }
      }
    }
    else {
      ctx.body = {
        code: 0,
        msg: "验证码不正确或已失效！"
      }
    }

  }
  /**
   * 获取用户个人信息
   */
  async myinfo() {
    const ctx = this.ctx;
    let unionid = ctx.query.unionid;
    const form = await this.app.mysql.get("wxuser", {
      unionid: unionid
    });
    this.ctx.body = {
      ...tip[200],
      data: form
    };
  }
  /**
   * 修改用户信息
   */
  async setuserinfo() {
    debugger
    const ctx = this.ctx;
    const form = ctx.request.body;
    const result = await this.app.mysql.update("wxuser", form, { where: { unionid: form.unionid } });
    if (result.affectedRows > 0) {
      ctx.body = {
        ...tip[200]
      };
    } else {
      ctx.body = {
        ...tip[2003]
      };
    }
  }
  /**
   * 保存微信用户信息
   */
  async savewxuser() {
    debugger
    const ctx = this.ctx;
    const form = ctx.request.body;
    delete form.privilege;
    //根据unionid判断用户是否存在
    const resform = await this.app.mysql.get("wxuser", {
      unionid: form.unionid
    });
    var request = require('request');
    var fs = require('fs');
    const name = form.unionid + ".jpg";
    await request(form.headimgurl).pipe(fs.createWriteStream('app/public/head/' + name));
    //存在用户资料
    if (resform) {
      resform.nickname = form.nickname;
      resform.headimgurl = name;
      const result = await this.app.mysql.update("wxuser", resform, { where: { unionid: resform.unionid } });
      if (result.affectedRows > 0) {
        delete resform.updateAt
        ctx.body = {
          ...tip[200],
          data: resform
        };
      }
      else {
        ctx.body = {
          code: 0,
          msg: "保存用户资料失败！"
        };
      }
    }
    else {
      form.headimgurl = name;
      form.status = 0;
      form.createAt = this.app.mysql.literals.now;
      const result = await this.app.mysql.insert("wxuser", form);
      if (result.affectedRows > 0) {
        ctx.body = {
          ...tip[200],
          data: form
        };
      }
      else {
        ctx.body = {
          code: 0,
          msg: "保存用户资料失败！"
        };
      }
    }

  }

  /**
   * 保存注册信息
   */
  async savereguser() {
    debugger
    const ctx = this.ctx;
    const form = ctx.request.body;
    delete form.privilege;
    const loginType = form.loginType;
    delete form.loginType;
    delete form.idCode;
    form.status = 1;
    form.updateAt = this.app.mysql.literals.now;
    const unionid = form.unionid, code = form.code, phone = form.phone;
    //先判断code是否正确
    const count = await this.app.mysql.query("select count(*) count from sendSms where unionid=? and sendCode=? and phone=? and TIMESTAMPDIFF(MINUTE,createAt,NOW())<=5", [unionid, code, phone]);
    if (count[0].count > 0) {
      const results = await this.app.mysql.query("update sendSms set status=2 where unionid=? and sendCode=?", [unionid, code]);
      if (results.affectedRows > 0) {
        delete form.code;

        if (loginType == 0) {
          //微信注册
          //手机号校验下是否存在
          form.unionid2 = form.unionid;
          const resultphone = await this.app.mysql.get("wxuser", { phone: form.phone });
          if (resultphone) {
            if (resultphone.unionid2 != form.unionid2) {
              if (!resultphone.openid || !resultphone.nickname) {
                //修改用户信息
                resultphone.openid = form.openid;
                resultphone.nickname = form.nickname;
                resultphone.sex = form.sex;
                resultphone.province = form.province;
                resultphone.city = form.city;
                resultphone.country = form.country;
                resultphone.headimgurl = form.headimgurl;
                resultphone.language = form.language;
                const updatewxuser = JSON.parse(JSON.stringify(resultphone));
                delete updatewxuser.unionid2;
                delete updatewxuser.createAt;
                delete updatewxuser.updateAt;
                delete updatewxuser.loginType;
                const resultupdate = await this.app.mysql.update("wxuser", updatewxuser, { where: { unionid: updatewxuser.unionid } });
              }
              await this.app.mysql.delete('wxuser', { unionid: form.unionid });
            }
            ctx.body = {
              ...tip[200],
              data: resultphone
            };
          }
          else {
            const result = await this.app.mysql.update("wxuser", form, { where: { unionid: form.unionid } });
            if (result.affectedRows > 0) {
              ctx.body = {
                ...tip[200],
                data: "ok"
              };
            }
            else {
              ctx.body = {
                code: 0,
                msg: "注册用户资料失败！"
              };
            }
          }

        }
        else {
          //手机注册
          //根据手机号 判断是否存在改记录信息
          //const resultselect=await this.app.mysql.query("select * from wxuser where phone=?",[form.phone]);
          const resultselect = await this.app.mysql.get('wxuser', { phone: form.phone });
          if (resultselect) {
            ctx.body = {
              ...tip[200],
              data: form
            };
          }
          else {
            form.createAt = this.app.mysql.literals.now;
            const result = await this.app.mysql.insert("wxuser", form);
            if (result.affectedRows > 0) {
              ctx.body = {
                ...tip[200],
                data: form
              };
            }
            else {
              ctx.body = {
                code: 0,
                msg: "保存用户资料失败！"
              };
            }
          }
        }


      }
      else {
        ctx.body = {
          code: 0,
          msg: "注册用户资料失败！"
        };
      }
    }
    else {
      ctx.body = {
        code: 0,
        msg: "验证码不正确或已失效！"
      }
    }


  }
  /**
   * 授权获取用户信息
   */
  async oathuser() {
    debugger
    const ctx = this.ctx;
    let code = ctx.query.code;
    const url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx1124be6bc1512298&secret=091885925a2232c6b7bf89f2eed30972&code=" + code + "&grant_type=authorization_code";

    const res = await ctx.curl(url, { dataType: 'json' });
    if (res.data.errcode) {
      ctx.body = {
        code: 0,
        msg: "授权失败"
      }
    }
    else {
      const userurl = "https://api.weixin.qq.com/sns/userinfo?access_token=" + res.data.access_token + "&openid=" + res.data.openid + "&lang=zh_CN";
      const userres = await ctx.curl(userurl, { dataType: "json" });
      if (userres.data.errcode) {
        ctx.body = {
          code: 0,
          msg: "获取用户信息失败"
        }
      }
      else {
        ctx.body = {
          code: 200,
          data: userres.data
        }
      }
    }
    /* await axios.get("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx1124be6bc1512298&secret=091885925a2232c6b7bf89f2eed30972&code=" + code + "&grant_type=authorization_code").then(res => {
      if (res.data.errcode) {
        ctx.body = {
          code: 0,
          msg: "授权失败"
        }
      }
      else {
        axios.get("https://api.weixin.qq.com/sns/userinfo?access_token=" + res.data.access_token + "&openid=" + res.data.openid + "&lang=zh_CN").then(tres => {
          if (tres.data.errcode) {
            ctx.body = {
              code: 0,
              msg: "获取用户信息失败"
            }
          }
          else {
            ctx.body = {
              code: 200,
              data: tres.data
            }
          }
        });
      }
    }) */
  }

  /**
   * 获取微信分享的信息
   */
  async getwxshare() {
    const ctx = this.ctx;
    const form = ctx.request.body;
    const pageurl = form.url;
    //获取企业中的ticket是否过期
    const result = await ctx.app.mysql.query("select access_token,jsapi_ticket from company where TIMESTAMPDIFF(SECOND,access_tokenAt,NOW())<=7000");
    if (result.length == 0) {
      //获取access_token
      const tokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx1124be6bc1512298&secret=091885925a2232c6b7bf89f2eed30972";
      const tokenres = await ctx.curl(tokenUrl, { dataType: "json" });
      if (tokenres.data.errcode) {
        ctx.body = {
          code: 0,
          msg: "获取token失败！=》" + JSON.stringify(tokenres.data)
        }
      }
      else {
        //access_token
        const access_token = tokenres.data.access_token
        //获取jsapi_ticket
        const ticketUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + access_token + "&type=jsapi&offset_type=1";
        const ticketres = await ctx.curl(ticketUrl, { dataType: "json" });
        if (ticketres.data.errcode == 0) {
          const ticket = ticketres.data.ticket;
          //存入数据库
          const updateform = {
            id: 1,
            access_token: access_token,
            jsapi_ticket: ticket,
            access_tokenAt: this.app.mysql.literals.now
          }
          const updresult = await this.app.mysql.update("company", updateform);
          if (updresult.affectedRows > 0) {
            const signres = sign(ticket, pageurl);
            ctx.body = {
              ...tip[200],
              data: signres
            }
          }
          else {
            ctx.body = {
              code: 0,
              msg: "缓存数据失败"
            }
          }
        }
        else {
          ctx.body = {
            code: 0,
            msg: "获取jsapi_ticket失败！=>" + JSON.stringify(ticketres.data)
          }
        }
      }
    }
    else {
      //存在access_token
      const ticket = result[0].jsapi_ticket;
      console.log(sign(ticket, pageurl));
      const signres = sign(ticket, pageurl);
      ctx.body = {
        ...tip[200],
        data: signres
      }
    }
  }
  async close() {
    debugger
    await this.app.mysql("DELETE FROM wxuser");
    await this.app.mysql("DELETE FROM enroll");
    await this.app.mysql("DELETE FROM user");
    /* let status = this.ctx.params.id;
    this.app.isClose = status ? status : 0;
    this.ctx.body = {
      ...tip[200]
    } */
  }
  /**
   * 获取app版本号
   */
  async getver() {
    const ctx = this.ctx;
    const result = await this.app.mysql.query("select * from company");
    if (result) {
      const from = {
        ver: result[0].ver,
        apk: "http://www.szdejurenhe.com/app/" + result[0].downloadname + ".apk"
      }
      ctx.body = {
        ...tip[200],
        data: from
      }
    }
  }
  /**
   * 下载文件名称
   */
  async downloadname() {
    const ctx = this.ctx;
    const result = await this.app.mysql.query("select * from company");
    if (result) {
      ctx.body = {
        ...tip[200],
        data: result[0].downloadname
      }
    }
  }
  /**
   * 验证号码是否存在
   * @param {*} code 
   * @param {*} unionid 
   */
  async vcode(code, unionid, phone) {
    debugger
    const result = await this.app.mysql.query("select count(*) as count from sendSms where unionid='" + unionid + "' and sendCode='" + code + "' and status!=" + 2);
    if (result.count > 0) {
      return 0;
    }
    else {
      const form = {
        phone: phone,
        sendCode: code,
        unionid: unionid,
        status: 0
      }
      form.createAt = this.app.mysql.literals.now;
      const result2 = await this.app.mysql.insert("sendSms", form);
      if (result2.affectedRows > 0) {
        return result2.insertId;
      }
      return 0;
    }
  }

  /**
     * 生成随机数
     * @param {位数} n 
     */
  async RndNum(n) {
    var rnd = "";
    for (var i = 0; i < n; i++)
      rnd += Math.floor(Math.random() * 10);
    return rnd;
  }

}

module.exports = AppController;
