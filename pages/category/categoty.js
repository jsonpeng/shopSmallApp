// pages/category/categoty.js
var app = getApp();
const ImgLoader = require('../../template/common/img-loader/img-loader.js');
var i = app.conf.pageTake;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentCatId: app.conf.category.currentCatId,
    currentChildCat: app.conf.category.currentChildCat,
    currentProduct: app.conf.category.currentProduct,
    skip: 0,
    winWidth: 0,
    // winHeight: 0,
    tab: 0,
    scrollTop: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化图片预加载组件
    this.imgLoader = new ImgLoader(this, this.imageOnLoad.bind(this));
    var cat_id = options.cat_id;
    // var leverl_2=options.themeData.currentChildCat;
    console.log('cat_id'+cat_id);
    // console.log(leverl_2);
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
    app.getCatChildrenAndProductByCatId(that, cat_id);
    app.getSystemHeightAndWidth(that);
  },


  switchtab: function (e) {
    var nowtab = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    if (this.data.tab === nowtab) {
      return false;
    } else {
      app.getOnlyCatProductByCatId(this, id, nowtab);
    }
  },

  imageOnLoad: function (err, data) {
    var that = this;
    // app.conf.index.allProduct = [];
    console.log('图片加载完成', err, data.src);
    app.varifyImageLazyLoaded(this.data.currentProduct, data.src, 'image', function (res) {
      that.setData({ currentProduct: res })
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
    app.getColorSet(this);
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
  scrollFunc: function (e) {
    var scrollTop = false
    if (e.detail.scrollTop > 0) {
      scrollTop = true
    }
  },
  onPullDownRefresh: function () {
    app.onPullDownRefresh(this);
  },
  //下拉监听
  pullUpLoad: function (res) {
    console.log('下拉');

  
    // app.getProductsByCatIdPagenate(this, this.data.currentCatId, this.data.currentProduct.length);
  
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.themeData.whetherShowMore){
        console.log('下一页');
        app.getProductsByCatIdPagenate(this, this.data.currentCatId, this.data.currentProduct.length);
    }
    // if (!this.data.themeData.tab) {
    //   app.commonpullUpLoad('getProducts', this, this.data.themeData.allProduct.length);
    // } else {
    //   app.commonpullUpLoad('getProductsBycatid', this, this.data.themeData.allProduct.length, '', this.data.themeData.cat_id);
    //   this.setData({
    //     whetherShowMore: true
    //   });
    // }

  },
  /**
    * 用户点击右上角分享
    */
  onShareAppMessage: function () {
    console.log(app.shareUrlRedirect());
    return app.shareUrlRedirect();
  },
})