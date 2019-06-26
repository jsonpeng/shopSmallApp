// pages/country_type/country_type.js
var app = getApp();
const ImgLoader = require('../../template/common/img-loader/img-loader.js');
var i = app.conf.pageTake;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    allProduct: app.conf.index.allProduct,
    country_products: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.imgLoader = new ImgLoader(this, this.imageOnLoad.bind(this));
    var that = this;
   
    if (options.country_id){
      app.getCountriesProducts(that, options.country_id);
    }
    that.setData({
      type: options.country_id
    })
    console.log(this.data.country_products);
  },
  // 图片预加载
  imageOnLoad: function (err, data) {
    var that = this;
    console.log('图片加载完成', err, data.src);
    app.varifyImageLazyLoaded(this.data.country_products, data.src, 'image', function (res) {
      that.setData({ country_products : res })
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
    if (!this.data.themeData.whetherShowMore) {
      app.getCountriesProducts(this, this.data.type, app.countLength(this.data.country_products));
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})