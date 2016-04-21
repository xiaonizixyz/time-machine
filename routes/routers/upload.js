'use strict';

var express = require('express');
var router = express.Router();
var constant = require('../../mixin/constant');
var async = require('async');
var ffmpeg = require('fluent-ffmpeg');

//var AccountController = require('../../controllers/account-controller');
//var accountController = new AccountController();

var Vedio = require('../../models/vedio');

function takeScreeshots(fileName, fileType, callback) {

  var originalFileLocation = __dirname + '/../../public/vedio/' + fileName;
  var photoName = fileName.replace(fileType, 'png');
  var photoLocation = __dirname + '/../../public/screeshots';

  ffmpeg(originalFileLocation)
      .on('filenames', function (filenames) {
        console.log('Will generate ' + filenames.join(', '))
      })
      .on('end', function (err, doc) {
        callback(err, doc);
      })
      .screenshots({
        // Will take screens at 20%, 40%, 60% and 80% of the video
        filename: photoName,
        count: 1,
        folder: photoLocation,
        size: '320x240'
      });

}

router.post('/', (req, res, next)=> {
  var userId = req.session.user.id;
  var file = req.files;
  var fileName = file.fileInfo.originalname;
  var fileType = file.fileInfo.extension;


  async.waterfall([
    (done)=> {
      //查找数据库是否存在某一用户上传过的某一同名视频
      Vedio.findOne({userId: userId, originalname: fileName}, done);
    }, (data, done)=> {
      if (data) {
        done(null, null);
      } else {
        //不存在,需要要记录一条记录 并生成图片
        takeScreeshots(fileName, fileType, (err, doc)=> {
          if (err) {
            done(err, null);
          } else {

            var creatTime = Date.parse(new Date()) / constant.time.MILLISECOND_PER_SECONDS;
            var screenshotsPath = 'public/screeshots/' + fileName.replace(fileType, 'png');

            var vedioInfo = Object.assign({}, file.fileInfo, {createTime: creatTime}, {userId: userId}, {screenshotsPath: screenshotsPath});

            var vedio = new Vedio(vedioInfo);
            vedio.save((err, doc, affectNum)=> {
              done(err, doc);
            })
          }
        });
      }
    }], (err, data)=> {

    if (err) return next(err);

    res.send({status: constant.httpCode.OK});
  });

});

router.post('/form', (req, res, next)=> {
  var userId = req.session.user.id;
  var form = req.body;

  //因为视频已经上传,但是可能详细的信息并没有填写 所以在此处要先查询该用户没填写详细信息的视频
  Vedio.findOne({userId: userId, isDetailsInfoComplete: false}, (err, doc)=> {
    if (err) return next(err);
    if (doc) {
      doc = Object.assign(doc, form, {isDetailsInfoComplete: true});
      doc.save((err, doc)=> {
        if (err) return next(err);
        res.send({status: constant.httpCode.OK});
      })
    }
  });
});

module.exports = router;