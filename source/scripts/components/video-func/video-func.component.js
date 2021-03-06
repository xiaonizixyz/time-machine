'use strict';
var React = require('react');
var Reflux = require('reflux');

var VideoFuncActions = require('../../actions/videofunc/videofunc-actions');
var VideoFuncStore = require('../../store/videofunc/videofunc-store');
var VideoStore = require('../../store/video/video-store');
var page = require('page');


function isEmptyObject(Object) {
  for (var key in Object) {
    return false;
  }
  return true;
}


var VideoFunc = React.createClass({

  mixins: [Reflux.connect(VideoFuncStore), Reflux.connect(VideoStore)],

  getInitialState: function () {
    return {
      thumbsupStatus: false,
      thumbsupNumbers: 0,
      starStatus: false,
      isLogin: false,
      playNumber: 0
    }
  },

  componentWillMount: function () {
    VideoFuncActions.getLoginStatus();
  },

  componentDidMount: function () {
    var href = window.location.href;
    var p = {
    url:'http://www.jiathis.com', /*获取URL，可加上来自分享到QQ标识，方便统计*/
    desc:'快来看看吧! ' + href, /*分享理由(风格应模拟用户对话),支持多分享语随机展现（使用|分隔）*/
    title:'时光机', /*分享标题(可选)*/
    summary:'这是来自时光机的分享', /*分享摘要(可选)*/
    pics:' ', /*分享图片(可选)*/
    flash: '', /*视频地址(可选)*/
    site:'', /*分享来源(可选) 如：QQ分享*/
    style:'103',
    width:50,
    height:16
    };
    var s = [];
    for(var i in p){
    s.push(i + '=' + encodeURIComponent(p[i]||''));
    }
    jQuery('#li-list').append(['<a class="qcShareQQDiv" href="http://connect.qq.com/widget/shareqq/index.html?',s.join('&'),'" target="_blank">分享到QQ</a>'].join(''));
    // document.write(['<a class="qcShareQQDiv" href="http://connect.qq.com/widget/shareqq/index.html?',s.join('&'),'" target="_blank">分享到QQ</a>'].join(''));

  },


  thumb: function () {
    if(!this.state.isLogin){
      page('register.html');
      return ;
    }
    var thumbsupStatus = !this.state.thumbsupStatus;
    var videoId = this.props.videoPlayInfo._id;

    if (thumbsupStatus) {
      //如果为true  表示已赞

      this.setState({
        thumbsupStatus: thumbsupStatus,
        thumbsupNumbers: this.state.thumbsupNumbers + 1
      });

    } else {
      //表示非赞
      this.setState({
        thumbsupStatus: thumbsupStatus,
        thumbsupNumbers: this.state.thumbsupNumbers - 1

      });
    }
    //向后台发送请求,设置最新的视频点赞状态

    VideoFuncActions.setThumbsUpStatus(thumbsupStatus, videoId);

  },

  star: function () {
    if(!this.state.isLogin){
      page('register.html');
      return ;
    }
    var starStatus = !this.state.starStatus;
    var videoId = this.props.videoPlayInfo._id;

    if (starStatus) {
      //如果为true  表示已收藏

      this.setState({
        starStatus: starStatus
      });

    } else {
      //表示未收藏
      this.setState({
        starStatus: starStatus
      });
    }
    //向后台发送请求,设置最新的视频收藏状态
    VideoFuncActions.setStarStatus(starStatus, videoId);

  },

  download: function () {
    if(!this.state.isLogin){
      page('register.html');
      return ;
    }
    var videoId = this.props.videoPlayInfo._id;
    page('/video/download/'+ videoId);
  },

  render: function () {

    var thumbsupStatus = this.state.thumbsupStatus ?
        (<i className="fa fa-thumbs-up" aria-hidden="true"/>) :
        (<i className="fa fa-thumbs-o-up" aria-hidden="true"/>);

    var starStatus = this.state.starStatus ?
        (<i className="fa fa-star" aria-hidden="true"/>) :
        (<i className="fa fa-star-o" aria-hidden="true"/>);




    return (
        <div id="videofunc-div">
          <div className="container">
            <section className="content">
              <ol id="li-list">
                <li className="" onClick={this.download}>
                  <span>
                    <i className="fa fa-download" aria-hidden="true"/>
                  </span>
                  <span className="download" onClick={this.download} >
                    下载
                  </span>
                </li>

                <li className="" >
                  <span className="star" onClick={this.star} >
                    {starStatus}
                  </span>
                  <span onClick={this.star}>{this.state.starStatus ? '已收藏' : '收藏'}</span>
                </li>

                <li className="" >
                  <span className="thumb" onClick={this.thumb} >
                    {thumbsupStatus}
                  </span>
                  <span onClick={this.thumb}>{this.state.thumbsupNumbers}</span>
                </li>

                <li className="play-number" >
                  <span className="playNumber">播放量：</span>
                  <span>{this.state.playNumber}</span>
                  </li>
              </ol>
            </section>
          </div>

        </div>
    )
  }
});

module.exports = VideoFunc;
