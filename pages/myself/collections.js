// pages/myself/collections.js
var app = getApp();
var cardTeams;
var startX;
var startY;
var endX;
var endY;
var key;
var maxRight = 87.5;
var first=true;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    products: [],
  },
  drawStart: function (e) {
    // console.log("drawStart");  
    var touch = e.touches[0];
    var index = parseInt(e.currentTarget.dataset.index);
    startX = touch.clientX;
    startY = touch.clientY;
    var cardTeams = this.data.products;
    for (var i in cardTeams) {
      var data = cardTeams[index];
      data.startRight = data.right;
    }

    key = true;
  },
  drawEnd: function (e) {
    console.log("drawEnd");
    var cardTeams = this.data.products;
    var index = parseInt(e.currentTarget.dataset.index);
    for (var i in cardTeams) {
      var data = cardTeams[index];
      if (data.right <= 100 / 2) {
        data.right = 0;
      } else {
        data.right = maxRight;
      }
    }
    this.setData({
      products: cardTeams
    });
  },
  drawMove: function (e) {
    //console.log("drawMove");  
    var self = this;
    var dataId = e.currentTarget.id;
    var cardTeams = this.data.products;
    if (key) {
      var touch = e.touches[0];
      endX = touch.clientX;
      endY = touch.clientY;
      console.log("startX=" + startX + " endX=" + endX);
      if (endX - startX == 0)
        return;
      var res = cardTeams;
      //从右往左  

      if ((endX - startX) < 0) {
        for (var k in res) {
          var data = res[k];
          if (res[k].id == dataId) {
            var startRight = res[k].startRight;
            var change = startX - endX;
            startRight += change;
            if (startRight > maxRight)
              startRight = maxRight;
            res[k].right = startRight;
          }
        }
      } else {//从左往右  
        for (var k in res) {
          var data = res[k];
          if (res[k].id == dataId) {
            var startRight = res[k].startRight;
            var change = endX - startX;
            startRight -= change;
            if (startRight < 0)
              startRight = 0;
            res[k].right = startRight;
          }
        }
      }
      self.setData({
        products: cardTeams
      });

    }
  },
  //删除item  
  delItem: function (e) {
    var product_id = e.target.dataset.id;
    var index = e.target.dataset.index;
    console.log("删除" + product_id);
    app.actionProductsCollect(this, product_id, false, this.data.products,index);

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;

    app.getCollectList(that, 0);



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