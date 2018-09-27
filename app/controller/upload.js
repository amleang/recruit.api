"use strict";
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");

const Controller = require("egg").Controller;

class UploadController extends Controller {
  async upload() {
    const ctx = this.ctx;
    //创建上传表单
    var form = new formidable.IncomingForm();
    //设置编辑
    form.encoding = "utf-8";
    //设置上传目录
    form.uploadDir = "app/public/images/";
    //保留后缀
    form.keepExtensions = true;
    //文件大小 2M
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.parse(ctx.request, function(err, fields, files) {
      if (err) {
        console.log("err=>", err);
        return;
      }
      var avatarName = Math.random() + "." + extName;
      var newPath = form.uploadDir + avatarName;
      fs.renameSync(files.fulAvatar.path, newPath); //重命名
    });
  }
}

module.exports = UploadController;
