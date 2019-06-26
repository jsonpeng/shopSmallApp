// pages/brands/list.js
var app=getApp();
const ImgLoader = require('../../template/common/img-loader/img-loader.js');
var i = app.conf.pageTake;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      products:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //初始化图片预加载组件
    this.imgLoader = new ImgLoader(this, this.imageOnLoad.bind(this));
    let that = this;
    app.getColorSet(that,function(res){
      if (options.brand_id) {
        app.getProductsByBrandId(that, options.brand_id);
      };
    });
  },
  imageOnLoad: function (err, data) {
    var that = this;
    console.log('图片加载完成', err, data.src);
    app.varifyImageLazyLoaded(this.data.products, data.src, 'image', function (res) {
      that.setData({ products: res })
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