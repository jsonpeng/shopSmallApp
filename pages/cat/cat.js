const ImgLoader = require('../../template/common/img-loader/img-loader.js');
//获取应用实例  
var app = getApp();
var click=false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop:0,
    cat:app.conf.cat,
    tab:0,
    winWidth: app.winWidth,
    winHeight: app.winHeight,
    autoHeight:420,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //app.saveImgFile('http://www.dorabuy.com/uploads/%E8%8A%B1%E7%8E%8B%E5%B0%BF%E4%B8%8D%E6%B9%BFL44/6401.png');
    //绑定分享关系
    app.bindShareRel(options);
  },
  imageOnLoad: function (err, data) {
    var that = this;
    console.log('图片加载完成', err, data.src)
    app.varifyImageLazyLoaded(this.data.allProduct, data.src, 'image', function (res) {
      that.setData({ allProduct: res })
    }, 'allProduct');
    
  },
  //监听滚动
  scrollFunc:function(e){
    var tab = this.data.tab;
    var that = this;
    var autoHeight = that.data.autoHeight;
    var maxTab = app.countLength(that.data.cat) - 1;
    console.log('在滚动top是:' + e.detail.scrollTop);
    tab = (e.detail.scrollTop / 110).toFixed(0);
    if (tab > maxTab){
      tab = maxTab;
    }
    if (tab < 0 || e.detail.scrollTop<=40){
      tab=0;
    }
    console.log("tab:"+tab);
    if (!click) {
      that.setData({
        tab: tab,
       // scrollTop: e.detail.scrollTop
      });
    }
    if (e.detail.scrollTop>0){
      click=false;
    }
  },
  //监听滚动到底部
  scrollFuncToLower:function(e){
    var that=this;
    console.log('滚动到底部了');
    setTimeout(function(){
      that.setData({
       //tab: that.data.cat.length-1
      });
    },300);
  },
  //左侧切换tab
  switchtab:function(e){
    var that = this;
    var nowtab = parseInt(e.currentTarget.dataset.index);
    var category_level = that.data.category_level;
    //一级分类
    if (category_level == 1) {
      //如果是所有
      if (nowtab==0){
          app.getProducts(that);
          that.setData({
            tab: nowtab,
          });
      }
      //如果是对应分类下的
      if (nowtab>0){
          var cat_id = e.currentTarget.dataset.id;
          app.getOnlyCatProductByCatId(that, cat_id, nowtab);

      }
    }
    //大于等于两级分类
    if (category_level >= 2){
        click=true;
        if (this.data.tab != nowtab) {
          that.setData({
            tab: nowtab,
            scrollTop: nowtab * 40
          });
        }
    }
  },
  onPullDownRefresh: function () {
    app.onPullDownRefresh(this);
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
    this.imgLoader = new ImgLoader(this, this.imageOnLoad.bind(this));
    that.setData({
      tabBar: app.tabBar
    });
    /*验证主题缓存*/
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
    app.AutoVarifyCache('allfunc', function (e) {
      if (!e) {
        app.getAllFunc(function (res) {
          app.getArrValueByKey('category_level', res, function (val) {
            app.varifyCatsLevelAction(val, that);
          });
        });
      } else {
        app.getArrValueByKey('category_level', e, function (val) {
          app.varifyCatsLevelAction(val, that);
        });
      }
    });

    app.AutoVarifyCache('switch', function (e) {
      if (!e) {
        app.getFuncSwithList(that);
      } else {
        that.setData({
          switch: e
        });
      }
    });

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
    console.log(app.shareUrlRedirect());
    return app.shareUrlRedirect();
  },
})