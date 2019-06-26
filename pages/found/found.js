// pages/found/found.js
var app = getApp();
//引入图片预加载组件
const ImgLoader = require('../../template/common/img-loader/img-loader.js');
var basicdata={
  toptab:0,
  bottomtab:0,
  type:0,
  whetherShowMore:false,
  winHeight: app.winHeight
};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    themeData: {},
    theme:'social'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化图片预加载组件
   // this.imgLoader = new ImgLoader(this, this.imageOnLoad.bind(this));
    this.imgLoader = new ImgLoader(this, this.imageOnLoad.bind(this));
    //绑定分享关系
    app.bindShareRel(options);
    var that = this;
    app.getSystemHeightAndWidth(that, true);
    that.setData({
      tabBar: app.tabBar,
      themeData: basicdata
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

    app.AutoVarifyCache('switch', function (e) {
      if (!e) {
        app.getFuncSwithList(that);
      } else {
        that.setData({
          switch: e
        });
      }
    });

    //获取默认logo
    app.AutoVarifyCache('allfunc', function (e) {
      if (!e) {
        app.getAllFunc(function (res) {
          app.getArrValueByKey('logo', res, function (val) {
            that.setData({
              'themeData.logo': val
            });
          });
        });
      } else {
        app.getArrValueByKey('logo', e, function (val) {
          that.setData({
            'themeData.logo': val
          });
        });
      }
    });

    //验证话题分类
    app.AutoVarifyCache('founds_cat', function (e) {
      if (!e) {
        //获取话题分类列表
        app.getFoundsCats(that);
      } else {
        that.setData({
          'themeData.post_cat_all': e
        });
      }
    });


    //验证话题文章
    app.AutoVarifyCache('founds_post', function (e) {
      if (!e) {
        //获取话题分类列表
        app.getFoundsPosts(that);
      } else {
        that.setData({
          'themeData.post_found': e
        });
        //转换内容
        for (var i = 0; i < e.length; i++) {
          //app.WxParse('themeData.contents[' + i + ']', 'html', e[i]['content'], that, 5);
        }

      }
    });

  },
  //加载完成后的回调
  imageOnLoad:function(err, data) {
    var that=this;
    console.log('图片加载完成', err, data.src)
    app.varifyImageLazyLoaded(this.data.themeData.post_cat_all, data.src,'image',function(res){
      that.setData({ 'themeData.post_cat_all': res })
      app.saveStorageName('founds_cat',res);
    });

    // if (typeof (this.data.themeData.post_found) !== 'undefined' && this.data.themeData.post_found.length){
    //   for (var i = 0; i < this.data.themeData.post_found.length;i++){
    //     app.varifyImageLazyLoaded(this.data.themeData.post_found[i].images, data.src, 'image', function (res) {
    //       var images = 'themeData.post_found[' + i + '].images';
    //       that.setData({ [images]: res });
    //       if (!that.data.themeData.toptab && !that.data.themeData.type){
    //         that.data.themeData.post_found[i]['images']=res;
    //         app.saveStorageName('post_found', that.data.themeData.post_found);
    //       }
    //     });
    //   }
    // }

  },
  back:function(e){
    this.setData({
        'themeData.type':0
    });
    app.getFoundsPosts(this);
  },
  previewImage:function(e){
    var index = e.currentTarget.dataset.index;
    var imageindex = e.currentTarget.dataset.imageindex;
    var image_arr = this.data.themeData.post_found[index]['images'];
    var image_new_arr=[];
    //处理image_arr
    for(var i in image_arr){
        image_new_arr.push(image_arr[i]['url']);
    }
    app.previewImage(image_new_arr, imageindex);
  },
  /**
   * 切换底部tab (最新/热门切换)
   */
  switchBottomTab:function(e){
    var that=this;
    //当前点击的index
    var nowtab =parseInt(e.currentTarget.dataset.index);
    //存在页面数据中的当前tab
    var bottomtab = parseInt(that.data.themeData.bottomtab);
    var cat_id = that.data.themeData.type;
      // that.setData({
      //   'themeData.post_found': []
      // });
        
        //热门的 //最新的
      app.getFoundsPosts(that, nowtab, cat_id);
    
        that.setData({
          'themeData.bottomtab': nowtab,
          'themeData.whetherShowMore':false
        });
    
  },
  /**
   * 切换顶部分类
   */
  switchFoundCat:function(e){
      var that=this;
      var cat_id=parseInt(e.currentTarget.dataset.id);

      var nowtab = parseInt(that.data.themeData.bottomtab);

      that.setData({
        'themeData.bottomtab': 0,
        'themeData.type': cat_id,
        'themeData.whetherShowMore': false
      });

      //热门的 //最新的
      app.getFoundsPosts(that,nowtab, cat_id);
  },
  /**
 * 下拉无限加载
 */
  pullUpLoad: function () {
      //console.log('下拉');
      var that=this;
      console.log(that.data.themeData.whetherShowMore);
      app.getFoundsPosts(that, parseInt(that.data.themeData.bottomtab), that.data.themeData.type, true, that.data.themeData.post_found.length);
 
    
  },
  /**
   * 切换顶部tab (分类间切换)
   */
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.setTabBar(app.getStorageName('theme').name, this);
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