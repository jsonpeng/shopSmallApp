
var app = getApp();
Page({

  data: {
    addressList:[],
    checknow:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //加载时读取到地址列表并且设置
    var that=this;
    app.getColorSet(this);
    app.AutoVarifyCache('switch', function (e) {
      if (!e) {
        app.getFuncSwithList(that);
      } else {
        that.setData({
          switch: e

        });
      }
    });
    // app.AutoVarifyCache('addressList' , function (e) {
    //   console.log('attrbute:'+e);
    //   if (!e) {
    
    //   }else{
    //     that.setData({
    //       addressList:e
    //     });
    //   }
    // });
    app.getAddressList(that);
    this.setData({
      checknow: app.conf.checknow
    });

  },
  //设定默认地址
  defaultAddress:function(e){
    var status =e.currentTarget.dataset.status;
    if (status=='true'){
      status=true;
    }else{
      status=false;
    }
    console.log(status);
    var address_id = e.currentTarget.dataset.id;
    app.defaultAddress(this, address_id,!status);

  },
  //在结算中选择
  checknowChoose:function(e){
    var checknow = this.data.checknow;
    var address_id = parseInt(e.currentTarget.dataset.id);;
    if (checknow){
      wx.redirectTo({
        url: '../shop_cart_pay/shop_cart_pay?addresss_id=' + address_id,
      });
    }
  },
  //删除地址
  delAddress:function(e){
      var that=this;
      wx.showModal({
      title: '芸来商城提示',
      content: '确认删除吗?该操作不可恢复',
      cancelText: '取消',
      confirmText: '删除',
      //confirmColor: 'orange',
      success: function (res) {
        if (res.confirm) {
          app.delAddressById(that, that.data.addressList, e.currentTarget.dataset.id,   e.currentTarget.dataset.index);
        } 
      }
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
    this.onLoad();
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
      console.log('下拉了');
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