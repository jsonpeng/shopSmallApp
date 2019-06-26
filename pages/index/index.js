var app = getApp();
const ImgLoader = require('../../template/common/img-loader/img-loader.js');
var i = app.conf.pageTake;
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    currentTab: 0,
    scrollLeft: 0,
    search_val: "",
    tab: 0,
    tabBar: app.tabBar,
    search_product_list: [],
    themeData: {
      allProduct:[]
    },
    theme: '',
    currentChildCat: app.conf.category.currentChildCat,
    imgUrls: app.conf.index.indexBanner,//首页banner
    winWidth: 0,
    winHeight: 0,
    swiperSet: {
      indicatorDots: false, //是否显示面板指示点，默认为false;
      autoplay: true, //是否自动切换，默认为false;
      interval: 5000,//自动切换时间间隔，默认5000ms;
      circular: true,//是否采用衔接滑动
      duration: 2000,//滑动动画时长，默认为1000ms;
      vertical: true,
    },
    // 首页轮播
    bannerSet: {
      indicatorDots: false, //是否显示面板指示点，默认为false;
      autoplay: true, //是否自动切换，默认为false;
      interval: 4000,//自动切换时间间隔，默认5000ms;
      circular: true,//是否采用衔接滑动
      duration: 1000,//滑动动画时长，默认为1000ms;
      vertical: false,
    },
    banner_list: [],
    timer: [0, 0, 0],
    catRecommend: app.conf.index.catRecommend,
    allProduct: app.conf.index.allProduct,
    newProduct: app.conf.index.newProduct,
    flash_sale_product: app.conf.index.flash_sale_product,
    team_sale_product: app.conf.index.team_sale_product,
    hasMore: true,
    hasRefesh: false,
    switch: {},
    scrollTop: false,
    whetherShowMore: false,
    image_new: '',
    image_prmop: '',
    image_sales_count: '',
    cat_product_list: app.conf.index.cat_product_list,
    country:'',
    morePage: true,
    name:'',
    num:'',
    tabbar : '',
    product:''
  },
  // 默认搜索框weui
  showInput: function () {
    this.setData({
      'themeData.inputShowed': true
    });
  },
  mini_redirect:function(e){
    let link = e.currentTarget.dataset.link;
    console.log(link)
    if (!app.empty(link)){

        wx.navigateTo({
          url: link,
        })
      
    }
  },
  hideInput: function () {
    this.setData({
      'themeData.inputVal': "",
      'themeData.inputShowed': false
    });
  },
  clearInput: function () {
    this.setData({
      'themeData.inputVal': ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      'themeData.inputVal': e.detail.value
    });
  },
  scrollFunc: function (e) {
    var scrollTop = false
    if (e.detail.scrollTop > 0) {
      scrollTop = true
    }
    //console.log(e.detail);
  },
  //搜索
  searchword: function (e) {
    app.searchProducts(this, e.detail.value);
    this.setData({
      'themeData.inputShowed': true
    })
  },
  //取消搜索
  searchCancel: function (e) {
    this.setData({
      'themeData.search_product_list': [],
      'themeData.search_val': '',
      'themeData.inputShowed': false
    });
  },
  
  //顶部切换tab
  switchtab: function (e) {
    var that = this;
    var nowtab = parseInt(e.currentTarget.dataset.index);
    // console.log(nowtab);
    //先置空
    that.setData({
      'themeData.allProduct': [],
      'themeData.whetherShowMore':false
    });
    app.conf.index.allProduct = [];
    //如果是所有
    if (nowtab == 0) {

      app.getProducts(that);

      var slug = 'index';
      that.setData({
        'themeData.imgUrls': []
      });
     
   
      app.getBanners(that, slug);
    }
    //如果是对应分类下的
    if (nowtab > 0) {
      var cat_id = e.currentTarget.dataset.id;
      var slug = e.currentTarget.dataset.slug;
      app.getBanners(that, slug); //广告图
      app.getCatChildrenAndProductByCatId(that, cat_id, true); //分类子分类
      // app.getOnlyCatProductByCatId(that, cat_id, nowtab); //子分类商品
      app.getProductsByCatIdPagenate(that, cat_id); 

      that.setData({
        'themeData.cat_id': cat_id,
        'themeData.scrollLeft': 100
      })
    }

    that.setData({
      'themeData.tab': nowtab,
    });
    i = that.data.themeData.allProduct.length;
    that.hideInput();
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    //绑定分享关系
    app.bindShareRel(options);
    var that = this;
    // that.setData({
    //   'themeData.allProduct': [],
    // });
    //店铺信息
    app.getAllFunc(function (res) {
      app.getArrValueByKey('name', res, function (val) {
        that.setData({
          'themeData.name':val
        })
        app.getSinglePageList(that,true,function(){

        });
      });
    });
    //获取系统的宽高度来赋值给当前对象
    app.getSystemHeightAndWidth(that, true);
    //验证功能开关缓存
    app.AutoVarifyCache('switch', function (e) {
      if (!e) {
        app.getFuncSwithList(that, true);
      } else {
        that.setData({
          'themeData.switch': e,
        });
      }
    });
  
    //初始化图片预加载组件
    this.imgLoader = new ImgLoader(this, this.imageOnLoad.bind(this));
    var that = this;

    //获取横幅
    app.getBanners(that, 'index');

    //获取秒杀商品
    app.getProducts(that, 0, 'flash_sales');

    //获取拼团商品
    app.getProducts(that, 0, 'team_sales');

    /*验证主题并且设置tabbar缓存*/
    app.AutoVarifyCache('theme', function (e) {
      var theme_name;
      if (!e) {
        app.getThemeSet(function (res) {
          console.log('theme:' + res.data.data.name);
          app.getFileWhetherHas(that, res.data.data.name);
          app.setTabBar(res.data.data.name, that);
          theme_name = res.data.data.name;
          if (theme_name == 'social') {
            //如果是social主题就做对应的操作
            app.getRootCats(that);

            // 环球国家馆
            app.getCountry(that);
            app.getProducts(that);
            // 首页精选好货
            app.AutoVarifyCache('allfunc', function (e) {
              if (!e) {
                app.getAllFunc(function (res) {
                  app.getArrValueByKey('image_new', res, function (val) {
                    that.setData({
                      'themeData.image_new': val
                    })
                  });
                  app.getArrValueByKey('image_prmop', res, function (val) {
                    that.setData({
                      'themeData.image_prmop': val
                    })
                  });
                  app.getArrValueByKey('image_sales_count', res, function (val) {
                    that.setData({
                      'themeData.image_sales_count': val
                    })
                  });
                });
              } else {
                app.getArrValueByKey('image_new', e, function (val) {
                  that.setData({
                    'themeData.image_new': val
                  })
                });
                app.getArrValueByKey('image_prmop', e, function (val) {
                  that.setData({
                    'themeData.image_prmop': val
                  })
                });
                app.getArrValueByKey('image_sales_count', e, function (val) {
                  that.setData({
                    'themeData.image_sales_count': val
                  })
                });
              }
            });
            app.AutoVarifyCache('notices', function (e) {
              if (!e) {
                app.getNotices(that);
              } else {
                that.setData({
                  'themeData.notices': e,
                });
              }
            });
            that.setData({
              'themeData.tab': 0,
              'themeData.swiperSet': that.data.swiperSet,
              'themeData.bannerSet': that.data.bannerSet,
              'themeData.scrollLeft': 0
            });
          }
          //如果是default主题就做对应的操作
          if (theme_name == 'default'){
            //获取推荐分类
            app.getCatsRecommend(that);
            //获取新品
            app.getProducts(that, 0, 'new_products');
          }
        });
      } else {
        app.getFileWhetherHas(that, e.name);
        app.setTabBar(e.name, that);
        theme_name = e.name;
        if (theme_name == 'social') {
          //如果是social主题就做对应的操作
          app.getRootCats(that);
 
          // 环球国家馆
          app.getCountry(that);
          app.getProducts(that)
          // 首页精选好货
          app.AutoVarifyCache('allfunc', function (e) {
            if (!e) {
              app.getAllFunc(function (res) {
                app.getArrValueByKey('image_new', res, function (val) {
                  that.setData({
                    'themeData.image_new': val
                  })
                });
                app.getArrValueByKey('image_prmop', res, function (val) {
                  that.setData({
                    'themeData.image_prmop': val
                  })
                });
                app.getArrValueByKey('image_sales_count', res, function (val) {
                  that.setData({
                    'themeData.image_sales_count': val
                  })
                });
              });
            } else {
              app.getArrValueByKey('image_new', e, function (val) {
                that.setData({
                  'themeData.image_new': val
                })
              });
              app.getArrValueByKey('image_prmop', e, function (val) {
                that.setData({
                  'themeData.image_prmop': val
                })
              });
              app.getArrValueByKey('image_sales_count', e, function (val) {
                that.setData({
                  'themeData.image_sales_count': val
                })
              });
            }
          });
          app.AutoVarifyCache('notices', function (e) {
            if (!e) {
              app.getNotices(that);
            } else {
              that.setData({
                'themeData.notices': e,
              });
            }
          });
          that.setData({
            'themeData.tab': 0,
            'themeData.swiperSet': that.data.swiperSet,
            'themeData.bannerSet': that.data.bannerSet,
            'themeData.scrollLeft': 0
          });
        }
        //如果是default主题就做对应的操作
        if (theme_name == 'default') {
          //获取推荐分类
          app.getCatsRecommend(that);
          //获取新品
          app.getProducts(that, 0, 'new_products');
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.hideLoading();
  },
  imageOnLoad: function (err, data) {
    var that = this;
    //console.log('图片加载完成', err, data.src)
    app.varifyImageLazyLoaded(this.data.themeData.allProduct, data.src, 'image', function (res) {
      that.setData({ 'themeData.allProduct': res })

    }, 'productsOnly');

    app.varifyImageLazyLoaded(this.data.themeData.allProduct, data.src, 'image', function (res) {
      that.setData({ 'themeData.allProduct': res })

    }, 'allProduct');
    // 新品推荐
    app.varifyImageLazyLoaded(this.data.themeData.newProduct, data.src, 'image', function (res) {
      that.setData({ 'themeData.newProduct': res })

    }, 'newProduct');
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (res) {
    var that=this;
    // that.setData({
    //   'themeData.tab': 0
    // });
    app.conf.index.allProduct = [];
    //获取所有商品
    // app.getProducts(that);
    // 店铺信息
    app.setTabBar(app.getStorageName('theme').name, that);
  },
  onPullDownRefresh: function () {

  },

//  页面上拉触底，加载更多商品
  onReachBottom:function(){
    if (!this.data.themeData.whetherShowMore && app.countLength(this.data.themeData.allProduct)){
      console.log('下一页');
      //sapp.alert(app.countLength(this.data.themeData.allProduct).toString());
      if (!this.data.themeData.tab) {
        console.log('a');
        app.getProducts(this, app.countLength(this.data.themeData.allProduct));
        //app.commonpullUpLoad('getProducts', this, this.data.themeData.allProduct.length);
      } else {
        app.getProductsByCatIdPagenate(this, this.data.themeData.cat_id, app.countLength(this.data.themeData.allProduct));
        // this.setData({
        //   whetherShowMore: true
        // });
      }
    }
  },
  // 首页搜索框点击切换
  click: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log('转发');
    console.log(app.shareUrlRedirect());
    return app.shareUrlRedirect();
  },

  // 底部拨打电话
  takeCall: function (e) {
    wx.makePhoneCall({
      phoneNumber: '13971217270' //仅为示例，并非真实的电话号码
    })
  },
  // 新版用户信息授权
  getInfo:function(res){
    console.log(res);
  }


  
})