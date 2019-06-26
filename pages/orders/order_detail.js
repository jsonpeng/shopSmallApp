// pages/orders/order_detail.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:{
      order:{},
      items:[],
    },
    pay_status: false,
    cancel_status: false,
    checknow: false,
    cancelReason: ['订单不能按时送达', '操作有误(商品，地址等)', '重复下单、误下单', '其他渠道价格更低', '该商品降价了', '不想买了','其他原因'],
  },
  /**
   * 调用微信支付
   */
  wechatPay:function(e){
    app.wechatPay(this,this.data.order.order.id);
  },
  /**
   * 打电话
   */
  tel:function(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel,
      success: function () {
        console.log("成功拨打电话")
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if(options.order_id){
        app.getOrderById(this,options.order_id);
      }
      if(options.pay_now){
        this.setData({
          pay_status:true
        });
      }
      if (options.cancle){
        this.setData({
          cancel_status: true
        });
      }
      app.getColorSet(this);
  },
  //取消订单选择操作
  cancelOrderDetail:function(e){
    var index=parseInt(e.currentTarget.dataset.index);
    app.cancelOrder(this.data.order.order.id,this.data.cancelReason[index]);
  },
  /**
   * 立刻支付
   */
  payNowAction:function(){
    this.setData({
          pay_status:true
        });
  },
  exitAction:function(){
    this.setData({
      pay_status: false,
      cancel_status:false
    });
  },
  keepAction:function(e){
    var type = e.currentTarget.dataset.type;
    if (type =='orderpay'){
      this.setData({
        pay_status: true,
      });
    }else{
    this.setData({
      cancel_status: true
    });
    }
  },
  /**
   * 取消订单
   */
  cancleAction:function(){
    this.setData({
      cancel_status: true
    });
  },
  //查询物流
  searchLogic:function(e){
    app.searchOrderList(e.currentTarget.dataset.type, e.currentTarget.dataset.id);
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