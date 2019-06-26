// pages/orders/orders.js
var app = getApp();
var i = app.conf.pageTake;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbar: ['全部', '待付款', '待发货', '待收货', '已完成'],
    currentTab: 0,
    pay:false,
    orders:[],
    whetherShowMore:false,
  },
  /**
   * 切换左侧tab
   */
  navbarTap: function (e) {
    app.getOrdersList(this,parseInt(e.currentTarget.dataset.idx)+1);
    //切换左侧tab就重置一次
    i = app.conf.pageTake;
  },  
  /**
   * 下拉无限加载
   */
  pullUpLoad:function(){
    console.log('下拉');
    i = app.commonpullUpLoad('getOrdersList', this, i, this.data.currentTab+1);
    console.log(i);
  },
  /**
   * 订单操作
   */
  orderAction:function(e){
    var type=e.currentTarget.dataset.type;
    var url=e.currentTarget.dataset.url;
    if(type=='orderpay'){
      wx.navigateTo({
        url: url,
      })
    }else{
      wx.showModal({
        title: '芸来商城提示',
        content: '确认取消订单吗?',
        showCancel: true,
        cancelText:'取消',
        confirmText: '确认',
       // confirmColor: 'orange',
        success: function (res) {
          if (res.confirm) {
            wx.redirectTo({
              url: url,
            })
          }
        }
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取系统的宽高度来赋值给当前对象
    app.getSystemHeightAndWidth(this);
    var currentTab = this.data.currentTab;
    if(options.order_id){
      currentTab =parseInt(options.order_id)-1;
    }
    //进来的时候置为空
    app.conf.orders.orders=[];
    app.getOrdersList(this, currentTab+1);
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