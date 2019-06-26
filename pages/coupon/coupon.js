// pages/coupon/coupon.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupons:[],
    couponsTab:-1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.getCoupons(this,this.data.couponsTab);
    // var that = this;
    // app.AutoVarifyCache('switch', function (e) {
    //   if (!e) {
    //     app.getFuncSwithList(that);
    //   } else {
    //     that.setData({
    //       switch: e

    //     });
    //   }
    // })
  },
  //切换tab
  switchTab:function(e){
    var coupons_id = e.currentTarget.dataset.id;
    app.getCoupons(this, coupons_id);
  },
  //展开更多
  actionOpen:function(e){
    var coupons = this.data.coupons;
    var status = app.varifyDefault(e.currentTarget.dataset.status);
    var index = parseInt(e.currentTarget.dataset.index);
    coupons[index]['status_state'] = status;
    this.setData({
      coupons: coupons
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