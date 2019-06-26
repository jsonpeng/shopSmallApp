// pages/myself/qrcode.js
var app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myself:'',
    user_share_code:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //店铺信息
    var that=this;
    app.getAllFunc(function (res) {
      app.getArrValueByKey('name', res, function (val) {
        that.setData({
          'themeData.name': val
        })
        app.getSinglePageList(that, true);

      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  shareImage:function(e){
    return app.shareImage(e);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    app.getShareCode(that);
    app.AutoVarifyCache('myself', function (e) {
      if (!e) {
        app.meInfo(that,function(res){
          that.setData({
            user_share_code: app.shareCodes(res.user.id)
          });
        });
      } else {
        that.setData({
          myself: e,
          user_share_code: app.shareCodes(e.user.id)
        });
      }
    });
    app.getSinglePageList(that);
    app.getColorSet(that);
   
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
  
  },
    // 底部拨打电话
  takeCall: function (e) {
    wx.makePhoneCall({
      phoneNumber: '13971217270' //仅为示例，并非真实的电话号码
    })
  }
})