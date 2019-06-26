// pages/shopinfo/shopinfo.js
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagelist:'',
    name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
      //店铺信息  
    app.getAllFunc(function (res) {
      app.getArrValueByKey('name', res, function (val) {
        that.setData({
          'themeData.name': val
        })
        app.getSinglePageList(that, false, function (e) {
          for (var i = e.length - 1; i >= 0; i--) {
            if (options.slug == e[i]['slug']) {
                var result=e[i];
            }
            that.setData({
              page: result
            })
          }
          WxParse.wxParse('contents', 'html', result.content, that, 5);
        });
      });
    });
    
    console.log(options.slug);

   
  
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