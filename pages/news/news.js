// pages/news/news.js
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notices:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    var news_id=options.news_id;
    var result;
    console.log('这是参数id  '+news_id);
    app.AutoVarifyCache('notices', function (e) {      
      if (!e) {
        app.getNotices(that,true);
      } else {
        for(var i=0;i<e.length;i++){
          if(e[i].id==news_id){
             result=e[i];
          }
        }

        that.setData({
          notices: result,
        });
      }
      WxParse.wxParse('contents', 'html', result.content, that, 5);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})