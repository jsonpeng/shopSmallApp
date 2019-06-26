// pages/flash_sale/flash_sale.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      flash_sale_product:[],
      timer: [0, 0, 0],
      time_arr:[],
      tab:0,
      delay:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    app.AutoVarifyCache('switch', function (e) {
      if (!e) {
        app.getFuncSwithList(that);
      } else {
        that.setData({
          switch: e

        });
      }
    })
    //开启倒计时
    app.StartTimerApi(that, 'index');
    //给予分配时间
   var hour_arr= app.countAllTimeByDetail(that,'day');
   //默认第一个时间
   var default_time = app.formatTimeByHour(hour_arr[that.data.tab]);
   console.log(default_time);
    //获取默认的秒杀商品
  // app.getProducts(that, 0 , 'flash_sales' , default_time);

  },
  /**
   * 切换tab
   */
  switchTab:function(e){
    var that=this;
    //当前选中的tab
    var nowtab = parseInt(e.currentTarget.dataset.index);
    var hour = app.formatTimeByHour(e.currentTarget.dataset.hour);
    //置换tab
    that.setData({
      tab:nowtab
    });
    //获取对应时间点的商品
    //app.getProducts(that, 0, 'flash_sales', hour);

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