var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme:'',
    themeData:{},
    userInfo:{
      nickName:'',
      avatarUrl:'',
    },
    teamsale_switch: app.conf.switch.FUNC_TEAMSALE,
    myself:'',
    isLogin:false,
    switch:{},
    winWidth: 0,
    winHeight: 0,
    myselfRow: {
      imgUrls: [
        '../../images/myself_row_1.png',
        '../../images/myself_row_2.png',
        '../../images/myself_row_3.png',
        '../../images/myself_row_4.png',
      ],
      title: [
        '待确认',
        '待付款',
        '待发货',
        '待收货',
      ]
    },
  },
  // 保存分享图片
  save: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'shareCanvas',
      success: function (res) {
        that.setData({
          sharePic: res.tempFilePath
        })
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
        })
        console.log("生成的图片路径为" + that.data.sharePic);
        wx.showModal({
          title: '',
          content: '图片已保存到手机相册',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options__'+options);
    //绑定分享关系
    app.bindShareRel(options);
    app.checknowStatus(false);
    app.getColorSet(this);
    // 分享二维码初始化
    this.setData({
      'themeData.shareCode' :false,
      'themeData.showCode': false
    })
  },
  //跳转重置checknow
  redirectUrl:function(e){
    app.conf.checknow=false;
        wx.navigateTo({
          url: e.currentTarget.dataset.url,
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
    var that = this;
    /*验证主题缓存*/
    app.AutoVarifyCache('switch', function (e) {
      if (!e) {
        app.getFuncSwithList(that,true);
      } else {
        that.setData({
          switch: e,
          'themeData.switch':e
        });
      }
    });
    // 小程序码
    //app.getShareCode(that);
    app.AutoVarifyCache('myself', function (e) {
      if (!e) {
        app.meInfo(that, function (res) {
          that.setData({
            'themeData.user_share_code': app.shareCodes(res.user.id)
          });
        });
      } else {
        that.setData({
          myself: e,
          'themeData.user_share_code': app.shareCodes(e.user.id)
        });
      }
    });

    app.AutoVarifyCache('myself', function (e) {
      if (!e) {
        app.meInfo(that);
      } else {
          that.setData({
            'themeData.myself': e
          });
      }
    });
    app.getColorSet(that);
    /*验证主题并且设置tabbar缓存*/
    app.AutoVarifyCache('theme', function (e) {
      if (!e) {
        app.getThemeSet(function (res) {
          console.log('theme:' + res.data.data.name);
          app.getFileWhetherHas(that, res.data.data.name);
          app.setTabBar(res.data.data.name, that);
        });
      } else {
        app.getFileWhetherHas(that, e.name);
        app.setTabBar(e.name, that);
      }
    });
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
    console.log('下拉');
    app.onPullDownRefresh(this);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },
  //清理缓存
  clearCache:function(){
    app.AutoCacheSet();
    app.alert('清理成功');
  },
  // 分享二维码弹出隐藏
  show: function () {
    this.setData({ 'themeData.shareCode': true, });
    console.log('执行show（）')
  },
  hide: function () {
    this.setData({
      'themeData.shareCode' : false
    })
  },
  showCode: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWID: res.windowWidth - 30,
          windowHEI: res.windowHeight * 0.9
        })
      }
    });
    that.setData({
      'themeData.showCode': true,
      'themeData.shareCode':false
    });

  },
  hideCode:function(){
    this.setData({ 'themeData.showCode': false, });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
   console.log(app.shareUrlRedirect());
   return app.shareUrlRedirect();
  },


  login:function(e){
    wx.redirectTo({
      url: '../login/login',
    });
  },




})