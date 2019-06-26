var app = getApp();
const ImgLoader = require('../../template/common/img-loader/img-loader.js');
var i = app.conf.pageTake;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    product_proms_list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.productPrompDetail(this, options.id);
    //初始化图片预加载组件
    this.imgLoader = new ImgLoader(this, this.imageOnLoad.bind(this));
    // 颜色设置
    app.getColorSet(this);
    this.setData({
      type: options.id
    })
  },
  
  imageOnLoad: function(err,data){
    var that = this;
    console.log('图片加载完成', err, data.src);
    app.varifyImageLazyLoaded(this.data.product_proms_list, data.src, 'image', function (res) {
      that.setData({ product_proms_list: res })
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
    if (!this.data.themeData.whetherShowMore){
      app.productPrompDetail(this, this.data.type, app.countLength(this.data.product_proms_list))
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})