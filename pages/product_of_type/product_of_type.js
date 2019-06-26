// pages/product_of_type/product_of_type.js
var app = getApp();
const ImgLoader = require('../../template/common/img-loader/img-loader.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // allProduct: app.conf.index.allProduct,
    themeData:{
      sales_count_products:[]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化图片预加载组件
    this.imgLoader = new ImgLoader(this, this.imageOnLoad.bind(this));
    var that=this;
    if(options.id==1){
      app.getProducts(that, 0, 'new_products');
    }else{
      app.getProducts(that, 0, 'sales_count_products');
    }
    that.setData({
      type: options.id
    })
    
    
  },
  imageOnLoad:function(err , data){
    var that = this;
    console.log('图片加载完成', err, data.src)
    let product = this.data.type == 1 ? this.data.themeData.newProduct : this.data.themeData.sales_count_products;
    let _typedata = this.data.type == 1 ? 'themeData.newProduct' : 'themeData.sales_count_products' ;
    app.varifyImageLazyLoaded(product, data.src, 'image', function (res) {

      that.setData({ [_typedata]: res })

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
        if (this.data.type == 1) {
          app.getProducts(this, app.countLength(this.data.themeData.newProduct), 'new_products');
        } else {
          app.getProducts(this, app.countLength(this.data.themeData.sales_count_products), 'sales_count_products');
        }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})