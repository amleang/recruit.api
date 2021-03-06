"use strict";
//node.js 文件操作对象
const fs = require('fs');
//node.js 路径操作对象
const path = require('path');
//故名思意 异步二进制 写入流
const awaitWriteStream = require('await-stream-ready').write;
//管道读入一个虫洞。
const sendToWormhole = require('stream-wormhole');
const md5 = require('md5');
const tip = require("../lib/tip")
const Controller = require("egg").Controller;

class UploadController extends Controller {
  async upload() {
    debugger;
    const ctx = this.ctx;
    //egg-multipart 已经帮我们处理文件二进制对象
    const stream = await ctx.getFileStream();
    //新建一个文件名
    const filename = md5(stream.filename) + path
      .extname(stream.filename)
      .toLocaleLowerCase();
    //文件生成绝对路径
    //当然这里这样市不行的，因为你还要判断一下是否存在文件路径
    const target = path.join('app/public/images', filename);
    //生成一个文件写入 文件流
    const writeStream = fs.createWriteStream(target);
    try {
      //异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (err) {
      //如果出现错误，关闭管道
      await sendToWormhole(stream);
      throw err;
    }
    //文件响应
    ctx.body = {
      ...tip[200],
      data: '/images/' + filename
    };
  }
}

module.exports = UploadController;
