// pages/brands/brands.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      '../../images/default/index/banner.jpg',
      '../../images/default/index/banner.jpg',
      '../../images/default/index/banner.jpg'
    ],
    indicatorDots: false, //是否显示面板指示点，默认为false;
    autoplay: true, //是否自动切换，默认为false;
    interval: 3000,//自动切换时间间隔，默认5000ms;
    circular: true,//是否采用衔接滑动
    duration: 1000,//滑动动画时长，默认为1000ms;
    brands:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.getBrandsList(this);
    var that = this;
    app.AutoVarifyCache('switch', function (e) {
      if (!e) {
        app.getFuncSwithList(that);
      } else {
        that.setData({
          switch: e

        });
      }
    })
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