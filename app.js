var zcjy = require('zcjy/index.js');
//引入图片预加载组件
const ImgLoader = require('template/common/img-loader/img-loader.js');
//html解析
var WxParse = require('wxParse/wxParse.js');
console.log("zcjy:" + JSON.stringify(zcjy));
App({
  onLaunch: function () {
    this.getUpdatestApp();
    //隐藏tabbar
    wx.hideTabBar();
    //启动先清除缓存
    this.removeCache(['token']);
    //获取主题
    this.getFuncSwithList();
    //获取所有的功能配置
    this.getAllFunc();
    //获取系统的宽高度
    this.getSystemHeightAndWidth();
    //当前不用chekcnow
    this.checknowStatus(false);
    //开启缓存任务
    //token任务(登录)
    this.autoTask('min', 15, 'token_task');
    //this.getUserInfo();
    //缓存数据任务
    //this.autoTask('min', 3, 'cache_task');

  },
  onShow: function () {
    //再次回来
    this.onLaunch();
    console.log('onShow');
  },
  onHide: function () {
    //用户退出小程序
    this.AutoCacheSet();
    console.log('onHide');
  },
  //重置checknow状态
  checknowStatus: function (status) {
    this.conf.checknow = status;
  },

  isContains: function (str, substr) {
    return zcjy.isContains(str, substr);
  },
  countFinalPrice: function (all_price, coupon_price, yue, jifen) {
    var final_price = (parseInt(all_price) - parseInt(coupon_price) - parseInt(yue) - parseInt(jifen)) < 0 ? 0 : (parseInt(all_price) - parseInt(coupon_price) - parseInt(yue) - parseInt(jifen));
    console.log(final_price);
    return final_price;
  },
  //判断主题是否存在
  getFileWhetherHas: function (obj = null, theme) {
    var that = this;
    wx.getFileInfo({
      filePath: 'template/' + theme,
      success: function (res) {
        // res.errMsg//接口调用结果
        // res.createTime//文件的保存时的时间戳，从1970/01/01 08:00:00 到当前时间的秒数
        // res.size//文件大小，单位B
      },
      complete: function (res) {
        console.log(theme);
        console.log(res);
        if (that.isContains(res.errMsg, 'fail file not exist')) {
          theme = that.conf.themeParent;
        }
        if (!that.empty(obj)) {
          obj.setData({
            theme: theme
          });
        }
      }
    });
  },

  /**
   * 定时任务
   */
  autoTask: function (types, times, task_name = 'cache_task') {
    var that = this;
    times = parseInt(times);
    if (types == "sec") {
      times = times * 1000;
    }
    if (types == "min") {
      times = times * 1000 * 60;
    }
    if (types == "hour") {
      times = times * 1000 * 60 * 60;
    }
    var timer = setInterval(function () {
      if (task_name == 'token_task') {
        that.getUserInfo();
      } else if (task_name == 'cache_task') {
        that.AutoCacheSet();
      }
    }, times);
    return timer;
  },
  /**
   * 退出登录
   */
  lougout: function () {
    wx.removeStorageSync('token');
    this.saveStorageName('hasLogin', false);
  },
  /**
   * 获取对应缓存的名称
   */
  getStorageName: function (name) {
    return zcjy.getStorageName(name);
  },
  /**
   * 存入任意缓存
   */
  saveStorageName: function (name, value) {
    return zcjy.saveStorageName(name, value);
  },
  //获取购物车的缓存
  getShopCartStorage: function () {
    var ShopCart = wx.getStorageSync('ShopCart') || [];
    //ShopCart=this.
    return ShopCart;
  },
  //直接存入购物车缓存 强制替换之前的
  saveShopCartStorage: function (shopcartlist) {
    wx.setStorageSync('ShopCart', shopcartlist);
  },
  //添加购物车缓存 可继续加
  addShopCartStorage: function (shopcartlist) {
    var ShopCart = wx.getStorageSync('ShopCart') || [];
    ShopCart.push(shopcartlist[0]);
    this.saveShopCartStorage(ShopCart);
    return ShopCart;
  },
  /**
   *获取用户信息及注册用户信息登录到系统
   */
  getUserInfo: function (parent_id = null) {
    var that = this;
    //调用登录接口
    wx.login({
      success: function (loginCode) {
        //console.log(loginCode);
        //获取基本用户信息
        wx.getUserInfo({
          success: function (res) {
            //console.log(res.userInfo);
            that.globalData.userInfo = res.userInfo;
            var login_data = {
              userInfo: {
                nickname: that.globalData.userInfo.nickName,
                head_image: that.globalData.userInfo.avatarUrl,
                sex: that.globalData.userInfo.gender == 1 ? '男' : '女',
                province: that.globalData.userInfo.province,
                city: that.globalData.userInfo.city,
              },
              code: loginCode.code,
              parent_id: parent_id
            };
            //console.log('login_data:' + JSON.stringify(login_data));
            zcjy.request(that, '/api/mini_program/login', function (res) {
              //console.log(res);
              if (!that.errorRes(res)) {

                that.globalData.token = res.data.data.token;
                that.saveStorageName('token', that.globalData.token);

                //登陆成功
                that.globalData.hasLogin = true;
                that.meInfo();

              }
            }, login_data);
          }
        })
      }
    });
  },


  // 获取国家馆
  getCountry: function (obj) {
    var that = this;
    zcjy.request(that, '/api/countries', function (res) {
      if (!that.errorRes(res)) {
        obj.setData({
          'themeData.country': res.data.data
        })
      } else {
        setTimeout(function () {
          that.getCountry(obj);
        }, 1000);
      }
    })
  },
  /**
   * 获取横幅
   * 传入参数[obj,slug](js对象,别名)
   * 
   */
  getBanners: function (obj, slug) {
    var that = this;
    zcjy.request(that, '/api/banners/' + slug, function (res) {
      if (!that.errorRes(res)) {
        that.conf.index.indexBanner = res.data.data;
        obj.setData({
          'themeData.imgUrls': that.conf.index.indexBanner
        });
      } else {
        setTimeout(function () {
          that.getBanners(obj, slug);
        }, 1000);
      }
    });
  },
  /**
   * 品牌街 品牌列表
   */
  getBrandsList: function (obj) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/brands', function (res) {
      if (!that.errorRes(res, obj)) {
        obj.setData({
          brands: res.data.data
        });
        that.hideLoading();
      }
    });
  },

  /**
 * 品牌商品列表
 */
  getProductsByBrandId: function (obj , brand_id , skip = 0 , take = this.conf.pageTake) {
    var that = this;
    that.loading();
    let product;
    zcjy.request(that, '/api/brand/' + brand_id, function (res) {
      if (!that.errorRes(res, obj)) {
        product = res.data.data;
        for (var i = product.length - 1; i >= 0; i--) {
          product[i]['maincolor'] = obj.data.themeData.maincolor;
        }
        obj.setData({
          products: product
        });
        that.hideLoading();
      }
      //同时发起全部图片的加载
      that.startManyImagesLoad(res.data.data, obj);
    },{skip:skip,take:take});
  },
  /**
   * 获取一级分类
   */
  getRootCats: function (obj) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/cats_root', function (res) {
      if (!that.errorRes(res)) {
        obj.setData({
          cats_root: res.data.data,
          'themeData.cats_root': res.data.data
        });
        that.saveStorageName('cats_root', res.data.data);
        that.hideLoading();
      } else {
        setTimeout(function () {
          that.getRootCats(obj);
        }, 1000);
      }
    });
  },
  /**
   * 获取推荐分类
   * 传入参数[obj](js对象)
   */
  getCatsRecommend: function (obj) {
    var that = this;
    zcjy.request(that, '/api/cats_of_recommend', function (res) {
      if (!that.errorRes(res)) {
        that.conf.index.catRecommend = res.data.data;
        obj.setData({
          catRecommend: that.conf.index.catRecommend
        });
      } else {
        setTimeout(function () {
          that.getCatsRecommend(obj);
        }, 1000);
      }
    });
  },
  /**
   * 根据分类等级做出对应的操作
   * 分类等级,js对象
   */
  varifyCatsLevelAction: function (cat_level, obj) {
    var that = this;

    //如果没有分类
    if (cat_level == 0) {
      that.getProducts(obj);
    }

    //如果只有一级分类
    if (cat_level == 1) {
      //初始化分类
      that.AutoVarifyCache('cats_root', function (e) {
        if (!e) {
          that.getRootCats(obj);
        } else {
          obj.setData({
            cats_root: e
          });
        }
      });
      //初始化商品
      that.getProducts(obj);
    }

    //如果分类等级大于等于2
    if (cat_level >= 2) {
      that.AutoVarifyCache('cat', function (e) {
        if (!e) {
          that.getCatsTop2Level(obj);
        } else {
          obj.setData({
            cat: e
          });
        }
      });
    }

    obj.setData({
      category_level: cat_level
    });

  },
  /**
   * 获取一,二级分类
   * 传入参数[obj](js对象)
   */
  getCatsTop2Level: function (obj) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/cats_top2_level', function (res) {
      if (!that.errorRes(res, obj)) {
        that.conf.cat = res.data.data;
        obj.setData({
          cat: that.conf.cat
        });
        that.saveStorageName('cat', that.conf.cat);
        that.hideLoading();
      }
    });
  },
  /**
   * 根据分类id获取子分类及商品
   * 传入参数[obj,cat_id](js对象,分类id)
   */
  getCatChildrenAndProductByCatId: function (obj, cat_id , use_social = false) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/children_of_cat/' + cat_id, function (res) {
      if (!that.errorRes(res, obj)) {
        that.conf.category.currentCatId = cat_id;
        that.conf.category.currentChildCat = res.data.data;
        if (use_social) {
          obj.setData({
            'themeData.currentChildCat': res.data.data
          });
        }
        zcjy.request(that, '/api/products_of_cat_with_children/' + cat_id, function (res2) {
          if (!that.errorRes(res2, obj)) {
            that.conf.category.currentProduct = [];
            that.conf.category.currentProduct = res2.data.data;
           
            //处理商品颜色
            var _product = that.conf.category.currentProduct;
            var _color;
            that.getColorSet(null, function (res) {
              _color = res.maincolor;
            });
            for (var i = _product.length - 1; i >= 0; i--) {
              _product[i]['maincolor'] = _color;
            }
            obj.setData({
              currentCatId: that.conf.category.currentCatId,
              currentChildCat: that.conf.category.currentChildCat,
              currentProduct: _product
            });
            that.startManyImagesLoad(res2.data.data, obj);
            that.hideLoading();
          }
        }, { skip: 0, take: that.conf.pageTake });
      }
    });
  },
  /**
   * 通过分类id拿商品
   */
  getProductsByCatId: function (obj, cat_id, skip = 0, take = this.conf.pageTake) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/products_of_cat_with_children/' + cat_id, function (res2) {
      if (!that.errorRes(res2, obj)) {
        if (res2.data.data.length == 0) {
          obj.data.whetherShowMore = true;
          obj.setData({
            'themeData.whetherShowMore': true
          });
          return;
        }
        that.conf.category.currentProduct = res2.data.data;
        obj.setData({
          currentProduct: that.conf.category.currentProduct ,
          'themeData.allProduct': that.autoPushData(that.conf.category.currentProduct, res2.data.data)
        });
        that.startManyImagesLoad(res2.data.data, obj);
        that.hideLoading();
      }
    }, { skip: skip, take: take });
  },
  /**
   * 分页获取商品
   */
  getProductsByCatIdPagenate: function (obj, cat_id, skip = 0, take = this.conf.pageTake) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/products_of_cat_with_children/' + cat_id, function (res2) {
      if (!that.errorRes(res2, obj)) {

          if (res2.data.data.length == 0) {
            that.hideLoading();
            obj.data.whetherShowMore = true;
            obj.setData({
              'themeData.whetherShowMore': true
            });
            return;
          }
        that.conf.category.currentProduct = that.autoPushData(that.conf.category.currentProduct, res2.data.data);
        that.conf.category.currentProduct = that.attachMainColorByProduct(that.conf.category.currentProduct);
        obj.setData({
          currentProduct: that.conf.category.currentProduct,
          'themeData.allProduct': that.autoPushData(that.conf.index.allProduct, res2.data.data),
          'themeData.currentProduct': that.autoPushData(that.conf.category.currentProduct, res2.data.data)
        });
        that.startManyImagesLoad(res2.data.data, obj);
      
        that.hideLoading();
      }
    }, { skip: skip, take: take });
  },
  /**
   * 只根据分类id获取当前的商品
   * 传入参数[obj,cat_id](js对象,分类id)
   */
  getOnlyCatProductByCatId: function (obj, cat_id, nowtab) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/products_of_cat_with_children/' + cat_id, function (res2) {
      if (!that.errorRes(res2, obj)) {
        that.conf.category.currentProduct = res2.data.data;

        for (var i = that.conf.category.currentProduct.length - 1; i >= 0; i--) {
          that.conf.category.currentProduct[i]['maincolor'] = obj.data.themeData.maincolor;
        }
        obj.setData({
          allProduct: that.conf.category.currentProduct,
          currentProduct: that.conf.category.currentProduct,
          tab: nowtab,
          'themeData.allProduct': that.conf.category.currentProduct
        });
        // 发起图片预加载
        that.startManyImagesLoad(res2.data.data, obj);
        that.hideLoading();
      }
    });
  },

  /**
   * 根据产品id获取产品详情
   * 传入参数[obj,product_id](js对象,产品id)
   */
  getProductContentById: function (obj, product_id) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/product/' + product_id, function (res2) {
      if (!that.errorRes(res2, obj)) {
        that.conf.product.products = res2.data.data;
        if (that.conf.product.products.specs.length != 0) {
          that.conf.product.products.specs = that.autoCombileSpec(that.conf.product.products.specs);
          that.startManyImagesLoad(that.conf.product.products.images, obj, 'url');
          obj.setData({
            product_id: product_id,
            products: that.conf.product.products,
            prom_type: that.varifyProductPrompType(that.conf.product.products.product, that.conf.product.products.promp)
            // specItemId: that.autoCombileSpec(that.conf.product.products.specs)
          });
        }
        else {
          obj.setData({
            product_id: product_id,
            products: that.conf.product.products,
            prom_type: that.varifyProductPrompType(that.conf.product.products.product, that.conf.product.products.promp)
          });
        }

        WxParse.wxParse('contents', 'html', that.conf.product.products.product.intro, obj, 5);
        that.hideLoading();
      }
    });
  },
  /* 根据产品id获取当前产品二维码 */
  getProductsCodeById: function (obj, product_id) {
    var that = this;
    zcjy.request(that, '/api/mini_program/product_code?product_id=' + product_id + '&token=' + that.globalData.token, function (res) {
      if (!that.errorRes(res, obj)) {
        obj.setData({
          product_code: that.conf.server + res.data.data
        })
      }
    })
  },
  /**
   * 整理规格信息 并把第一个自动置为active
   */
  autoCombileSpec: function (specs) {
    return zcjy.autoCombileSpec(specs);
  },
  /**
   * 整理列表 加上状态位
   */
  autoAttachStatusForData: function (coupon_list) {
    return zcjy.autoAttachStatusForData(coupon_list);
  },
  /**
   * 切换规格的状态
   */
  switchSpecStatus: function (specs, index1, index2) {
    return zcjy.switchSpecStatus(specs, index1, index2);
  },
  /**
   * 整理出选中状态的规格商品的key
   */
  autoCombSpecKey: function (specs) {
    return zcjy.autoCombSpecKey(specs);
  },
  /**
   * 通过key找到对应的规格商品的数组位置
   * 传入参数[specprice,key]
   * 返回[int index](数组的位置)
   */
  findSpecPriceIndex: function (specprice, key) {
    return zcjy.findSpecPriceIndex(specprice, key);
  },

  /**
   *猜你喜欢的产品列表
   *传入参数[obj,product_id](js对象,产品id)
   */
  getFavProductById: function (obj, product_id) {
    var that = this;
    zcjy.request(that, '/api/fav_product/' + product_id, function (res2) {
      if (!that.errorRes(res2)) {
        that.conf.product.fav_product_list = res2.data.data;
        let _product = that.conf.product.fav_product_list;
        var _color;
        that.getColorSet(null, function (res) {
          _color = res.maincolor;
        });
        for (var i = _product.length - 1; i >= 0; i--) {
          _product[i]['maincolor'] = _color;
        }
        obj.setData({
          fav_product_list: _product
        });
      } else {
        setTimeout(function () {
          that.getFavProductById(obj, product_id);
        }, 1000);
      }
    });
  },

  /**
   *函数描述:获取不同类型的产品 带分页
   *请求url:https://shop-model.yunlike.cn/api/types?/
   *传入参数[obj,skip,types,take](js对象,跳过多少个,类型默认不传入获取所有商品,一次拿多少)
   *说明1：types=new_products 新品推荐
   *说明2：types=team_sales 拼团产品
   *说明3：types=flash_sales 秒杀商品
   *请求成功更新对应页面的商品列表
   */
  getProducts: function (obj, skip = 0, types = '', time_beign = false, take = this.conf.pageTake) {
    var that = this;
    var product = types == '' ? 'products' : types;
    that.loading();
    var data = !time_beign ? {
      skip: skip,
      take: take
    } : {
        skip: skip,
        take: take,
        time_begin: time_beign
      };
    zcjy.request(that, '/api/' + product, function (res) {
      if (!that.errorRes(res)) {
      
        if (product == 'products') {
          if (res.data.data.length == 0) {
            that.hideLoading();
            obj.data.whetherShowMore = true;
            obj.setData({
              'themeData.whetherShowMore': true
            });
            return;
          }
          console.log(res.data.data);
          //console.log(that.autoPushData(that.conf.index.allProduct, res.data.data));
       
          //obj.data.themeData = {},
          obj.setData({
            // allProduct: that.autoPushData(that.conf.index.allProduct, res.data.data),
            'themeData.allProduct': that.autoPushData(obj.data.themeData.allProduct, res.data.data)
          });
          //同时发起全部图片的加载
          that.startManyImagesLoad(res.data.data, obj);
          //console.log(obj.data.themeData.allProduct);
          that.saveStorageName('index', obj.data);
        } else if (product == 'new_products') {
          if (res.data.data.length == 0) {
            that.hideLoading();
            obj.data.whetherShowMore = true;
            obj.setData({
              'themeData.whetherShowMore': true
            });
            return;
          }
          that.conf.index.newProduct = res.data.data;
          obj.setData({
            'themeData.newProduct': that.autoPushData(that.conf.index.newProduct, res.data.data)
          });
          that.startManyImagesLoad(res.data.data, obj);
        } else if (product == 'flash_sales') {
          that.conf.index.flash_sale_product = res.data.data;
          //秒杀专场页面中
          if (time_beign) {
            obj.setData({
              flash_sale_product: that.conf.index.flash_sale_product
            });
          } else {
            //首页
            obj.setData({
              'themeData.flash_sale_product': that.conf.index.flash_sale_product
            });
          }
        } else if (product == 'team_sales') {
          that.conf.index.team_sale_product = res.data.data;
          obj.setData({
            team_sale_product: that.conf.index.team_sale_product,
            'themeData.team_sale_product': that.conf.index.team_sale_product
          });
        } else if (product == 'sales_count_products') {
          if (res.data.data.length == 0) {
            that.hideLoading();
            obj.data.whetherShowMore = true;
            obj.setData({
              'themeData.whetherShowMore': true
            });
            return;
          }
          obj.setData({
            'themeData.sales_count_products': that.autoPushData(obj.data.themeData.sales_count_products, res.data.data)
          });
          that.startManyImagesLoad(res.data.data, obj);
        }
        that.hideLoading();
      }
      else {
        setTimeout(function () {
          that.getProducts(obj, skip, types, time_beign, take);
        }, 1000);
      }
    }, data);
  },
  //获取国家馆商品
  getCountriesProducts: function (obj, country_id, skip = 0, take = this.conf.pageTake) {
    var that = this;
    zcjy.request(that, '/api/country_products/' + country_id, function (res) {
      if (!that.errorRes(res)) {
        if (res.data.data.length == 0) {
          that.hideLoading();
          obj.data.whetherShowMore = true;
          obj.setData({
            'themeData.whetherShowMore': true
          });
          return;
        }
        obj.setData({
          country_products: that.autoPushData(obj.data.country_products,res.data.data),
          'themeData.country_products': res.data.data
        });
        that.startManyImagesLoad(res.data.data, obj);

      }
    },{skip:skip,take:take});
  },
  /**
   * 倒计时
   * 传入参数[end_time_detail,types](结束时间,类型默认是返回字符串)
   * 返回值[array或string](对应小时分钟秒)
   */
  ShowCountDown: function (end_time_detail, types) {
    end_time_detail = end_time_detail.replace(/-/g, '/');
    // console.log(end_time_detail);
    var dates = new Date(Date.parse(end_time_detail));
    // console.log(dates);
    var year = dates.getFullYear();
    // console.log('year:'+year);
    var month = dates.getMonth() + 1;
    var day = dates.getDate();
    var hour = dates.getHours();
    var min = dates.getMinutes();
    var sec = dates.getSeconds();
    var now = new Date();
    var endDate = new Date(year, month - 1, day, hour, min, sec);
    var leftTime = endDate.getTime() - now.getTime();
    var leftsecond = parseInt(leftTime / 1000);
    //如果时间小于0就过期
    if (leftsecond <= 0) {
      return false;
    }
    var day1 = Math.floor(leftsecond / (60 * 60 * 24));
    var hour = Math.floor((leftsecond - day1 * 24 * 60 * 60) / 3600);
    var minute = Math.floor((leftsecond - day1 * 24 * 60 * 60 - hour * 3600) / 60);
    var second = Math.floor(leftsecond - day1 * 24 * 60 * 60 - hour * 3600 - minute * 60);

    //"距离"+year+"年"+month+"月"+day+"日还有："+day1+"天"+hour+"小时"+minute+"分"+second+"秒"; 
    if (hour < 10) {
      hour = "0" + hour;
    }
    if (minute < 10) {
      minute = "0" + minute;
    }
    if (second < 10) {
      second = "0" + second;
    }

    if (types == 'index') {
      return [hour, minute, second];
    } else {
      return hour + ':' + minute + ':' + second;
    }
  },
  /**
   * 分割当前时间为偶数
   */
  countAllTimeByDetail: function (obj = '', type = 'hour') {
    var that = this;
    var myDate = new Date();
    if (type == 'hour') {
      var hour = myDate.getHours();
      if (hour % 2 != 0) {
        hour = hour - 1
      }
      var hour_arr = [hour, hour + 2, hour + 2 * 2, hour + 2 * 3, hour + 2 * 4];
      if (!that.empty(obj)) {
        obj.setData({
          time_arr: that.varifyTimeDisplay(hour_arr)
        });
      }
      return hour_arr;
    }
    else if (type == 'day') {
      var day = myDate.getDate();

      var month = myDate.getMonth() + 1;
      if (month < 10) {
        month = '0' + month;
      }
      month = month.toString();
      var day_arr = [month + '-' + day, month + '-' + (day + 1), month + '-' + (day + 2), month + '-' + (day + 3), month + '-' + (day + 4)];
      if (!that.empty(obj)) {
        obj.setData({
          time_arr: day_arr
        });
      }
      return day_arr;
    }

  },
  /**
   * 优化时间数组显示
   */
  varifyTimeDisplay: function (arr) {
    for (var i in arr) {
      if (arr[i] < 10) {
        arr[i] = "0" + arr[i]
      }
    }
    return arr;
  },

  /**
   * 倒计时接口
   * 传入参数[obj,end_time_detail,types](js对象,倒计时的时间,类型)
   * 返回值[timer](即定时的timer可用来重置销毁定时器)
   */
  returnTimer: function (obj, end_time_detail, types = 'defalut', index = false) {
    var that = this;
    var timer = setInterval(function () {
      if (!index) {

        obj.setData({
          timer: that.ShowCountDown(end_time_detail, types),
          delay: !that.ShowCountDown(end_time_detail, types) ? true : false
        });
      } else {
        obj.setData({
          'themeData.timer': that.ShowCountDown(end_time_detail, types)
        });
      }
    }, 1000);
    return timer;
  },

  /**
   * 倒计时开启
   * 传入参数[obj,types](js对象,类型)
   * 返回值[timer](即定时的timer可用来重置销毁定时器)
   */
  StartTimerApi: function (obj, types = 'defalut', index = false) {
    var that = this;
    zcjy.request(that, '/api/timer', function (res) {
      if (!that.errorRes(res)) {
        var date = res.data.data.date;
        //console.log(date);
        //console.log(that.ShowCountDown(date));
        return that.returnTimer(obj, date, types, index);
      } else {
        setTimeout(function () {
          that.StartTimerApi(obj, types, index);
        }, 1000);
      }
    });
  },
  /**
   * 整理购物车相同的商品
   */
  mergeCart: function (cart_list, one_item) {
    return zcjy.mergeCart(cart_list, one_item);
  },
  /**
 * 根据购物车列表对象
 * 计算购物车的总价及数量[shopCartList OBJECT](购车车列表对象)
 */
  countAllNumAndPrice: function (obj, shopCartList) {
    zcjy.countAllNumAndPrice(obj, shopCartList);
  },
  /**
   * 获取地址列表
   * 
   */
  getAddressList: function (obj, defaults_show = false, callback = null) {
    var that = this;
    //that.loading();
    zcjy.request(that, '/api/get_address?token=' + that.globalData.token, function (res) {
      if (!that.errorRes(res, obj)) {
        obj.setData({
          addressList: res.data.data,
          address: that.autoReturnAddress(res.data.data)
        });
        if (typeof (callback) == 'function') {
          callback(that.autoReturnAddress(res.data.data));
        }
        that.conf.addressList = res.data.data;
        that.saveStorageName('addressList', that.conf.addressList);
        //console.log(res.data.data.length);
        if (defaults_show && res.data.data.length == 0) {
          wx.showModal({
            // title: '芸来商城提示',
            content: '您还未设置收货地址',
            showCancel: false,
            confirmText: '现在设置',
            confirmColor: that.conf.themeColor,
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '../address/action?checknow=true',
                })
              }
            }
          });
        }
      }
    });
  },
  /**
   * 自动返回设置成默认收货的地址或者第一个地址
   */
  autoReturnAddress: function (address_list) {
    return zcjy.autoReturnAddress(address_list);
  },
  /**
   * 获取第一级省份列表
   */
  getBasicProvinceList: function (obj) {
    var that = this;
    zcjy.request(that, '/api/provinces', function (res) {
      if (!that.errorRes(res, obj)) {
        obj.setData({
          provinces: that.mergeCities(res.data.data),
          provinces_many: res.data.data
        });
      }
    }, {}, true);
  },
  unshiftDefaultValue: function (cities_list) {
    return cities_list.unshift({ id: 0, name: '请选择' });
  },
  /**
   * 根据父级的城市id获取子集的列表
   */
  getChildrenCitiesListByParentId: function (obj, parent_id, types = 'cities') {
    var that = this;
    zcjy.request(that, '/api/cities/' + parent_id, function (res) {
      if (!that.errorRes(res)) {
        if (types == 'cities') {
          obj.setData({
            city: res.data.data[0]['id'],
            cities: that.mergeCities(res.data.data),
            cities_many: res.data.data,
            districts: [],
            districts_many: [],
            district: 0,
            citiesIndexType: 0,
          });
        } else {
          obj.setData({
            district: res.data.data[0]['id'],
            districts: that.mergeCities(res.data.data),
            districts_many: res.data.data,
            districtsIndexType: 0
          });
        }
      } else {
        setTimeout(function () {
          that.getChildrenCitiesListByParentId(obj, parent_id, types);
        }, 1000);
      }
    }, {}, true);
  },
  /**
   * 整理成name列表
   */
  mergeCities: function (cities_list) {
    return zcjy.mergeCities(cities_list);
  },
  /**
   * 获取城市的id通过位置
   */
  getCitiesIdByIndex: function (cities_list, index) {
    //减去选择的那一个
    index = index - 1;
    return typeof (cities_list[index]['id']) === 'undefined' ? 0 : cities_list[index]['id'];
  },
  /**
   * 获取城市的位置通过id
   */
  getCitiesIndexById: function (cities_list, id) {
    return zcjy.getCitiesIndexById(cities_list, id);
  },
  /**
   * 添加地址 编辑地址
   * 传入参数(名称,电话,详细地址,省,市,区,是否设置成默认地址,是否在结算中添加,是否编辑,address_id)
   */
  saveAddress: function (name, phone, detail, province, city, disrict, defaults = false, checknow = false, edit = false, address_id = '') {
    var that = this;
    that.loading();
    console.log(defaults);
    var data = defaults && defaults != 'false' ? {
      name: name,
      phone: phone,
      detail: detail,
      province: province,
      city: city,
      district: disrict,
      default: defaults,
    } : {
        name: name,
        phone: phone,
        detail: detail,
        province: province,
        city: city,
        district: disrict,
      };
    console.log(data);
    var address_stat = edit ? 'modify_address/' + address_id.toString() : 'add_address';
    console.log(address_stat);

    zcjy.request(that, '/api/' + address_stat, function (res) {
      if (!that.errorRes(res)) {
        that.hideLoading();
        //that.removeCache(['addressList']);
        var addressList = zcjy.autoContactArr(that.getStorageName('addressList'), res.data.data);
        that.saveStorageName('addressList', addressList);
        if (!checknow) {
          wx.redirectTo({
            url: '../address/address',
          });
        } else {
          wx.redirectTo({
            url: '../shop_cart_pay/shop_cart_pay?addresss_id=' + res.data.data.id,
          });
        }
      }
    }, data, true);
  },
  /**
   * getSingeAddress
   */
  getSingeAddress: function (address_id) {
    var that = this;
    return zcjy.getSingeAddress(that, address_id);
  },
  //加载中动画
  loading: function (times = this.conf.networkTimeout.request, without_delay = false, delay_time = this.conf.delay_time) {

    var that = this;
    that.load = true;
    if (!without_delay) {
      setTimeout(function () {

        if (that.load) {
          wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: times
          });
        }

      }, delay_time);
    }
  },
  //操作成功提示
  alert: function (title, success = 'success') {
    wx.showToast({
      title: title,
      icon: success,
      duration: 3000
    });
  },
  // 未选择商品时提交订单提示
  openAlert: function () {
    wx.showModal({
      content: '请选择商品',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    });
  },
  //隐藏加载动画
  hideLoading: function (delay_time = this.conf.delay_time) {
    //setTimeout(function () {
    this.load = false;
    wx.hideToast();
    //}, delay_time);
  },
  /**
   * 获取地址编辑页面
   */
  getEditAddress: function (obj, address_id) {
    var that = this;
    that.loading();
    wx.request({
      url: that.conf.server + '/api/get_address/' + address_id + '?token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res)) {
          var address = res.data.data.address;
          var provinces_many = res.data.data.cities_level1;
          var cities_many = res.data.data.cities_level2;
          var districts_many = res.data.data.cities_level3;
          obj.setData({
            address_id: address_id,
            edit: true,
            name: address.name,
            phone: address.phone,
            detail: address.detail,
            checknow: '',
            default: that.varifyDefault(address.default),
            provinces: that.mergeCities(provinces_many),
            provinces_many: provinces_many,
            province: address.province,
            city: address.city,
            district: address.district,
            provincesIndexType: that.getCitiesIndexById(provinces_many, address.province),
            cities: that.mergeCities(cities_many),
            cities_many: cities_many,
            citiesIndexType: that.getCitiesIndexById(cities_many, address.city),
            districts: that.mergeCities(districts_many),
            districts_many: districts_many,
            districtsIndexType: that.getCitiesIndexById(districts_many, address.district),
          });
          that.hideLoading();
        }
      }
    });
  },
  /**
   * 根据地址id删除地址
   */
  delAddressById: function (obj, address_list, address_id, address_index) {
    var that = this;
    that.loading();
    address_index = parseInt(address_index);
    address_list.splice(address_index, 1);
    wx.request({
      url: that.conf.server + '/api/delete_address/' + address_id + '?token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res)) {
          obj.setData({
            addressList: address_list
          });
          that.saveStorageName('addressList', address_list);
          that.hideLoading();
        }
      }
    });
  },
  /**
   * 根据request返回的status_code处理401错误500错误(请求频率过高,高并发,服务器等问题)
   * 用户个人中心带token验证的用得到 
   * 传入参数:[wx_response object,obj object](reques返回的参数,js对象[列表页建议传入])
   **/
  errorRes: function (wx_response, obj = '') {
    var that = this;
    var status_code = parseInt(wx_response.data.status_code);
    var status = false;
    if (status_code == 401) {
      if (status_code == 401) {
        //存在401就重新拿一次token
        this.getUserInfo();
      }
      status = true;
      if (!that.empty(obj)) {
        //重载页面
        setTimeout(function () {
          obj.onLoad();
        }, 1000);
      }
    }
    if (status_code == 500) {
      wx.showModal({
        // title: '芸来商城提示',
        content: '服务器开了小差,请再等等',
        showCancel: false,
        confirmColor: that.conf.themeColor,
        success: function (res) {
          if (res.confirm) {
            // wx.navigateBack({
            //   delta: 1
            // });
          }
        },
      });
    }
    //console.log("response code:" + status_code);
    //后台发送过来的话就报错显示提示
    if (status_code == 1) {
      wx.showModal({
        // title: '芸来商城提示',
        content: wx_response.data.data,
        showCancel: false,
        confirmColor: that.conf.themeColor,
      });
    }
    return status;
  },
  /**
   * 用户积分记录
   * 传入参数(js对象,跳过多少个,一次拿多少个)
   */
  getCredits: function (obj, skip = 0, take = this.conf.pageTake) {
    var that = this;
    that.loading();
    wx.request({
      url: that.conf.server + '/api/credits?skip=' + skip + '&take=' + take + '&token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res, obj)) {
          obj.setData({
            credits: res.data.data,
            user: that.getStorageName('myself')
          });
          that.hideLoading();
        }
      }
    });
  },
  /**
   * 用户余额记录
   * 传入参数(js对象,跳过多少个,一次拿多少个)
   */
  getFunds: function (obj, skip = 0, take = this.conf.pageTake) {
    var that = this;
    that.loading();
    wx.request({
      url: that.conf.server + '/api/funds?skip=' + skip + '&take=' + take + '&token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res, obj)) {
          obj.setData({
            funds: res.data.data,
            user: that.getStorageName('myself')
          });
          that.hideLoading();
        }
      }
    });
  },
  /**
   * 用户分佣记录
   * 传入参数(js对象,跳过多少个,一次拿多少)
   */
  getBouns: function (obj, skip = 0, take = this.conf.pageTake) {
    var that = this;
    that.loading();
    wx.request({
      url: that.conf.server + '/api/bouns?skip=' + skip + '&take=' + take + '&token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res, obj)) {
          obj.setData({
            bouns: res.data.data,
            user: that.getStorageName('myself')
          });
          that.hideLoading();
        }
      }
    });
  },
  /**
   * 推荐人列表
   * 传入参数(js对象,跳过多少个,一次拿多少个)
   */
  getParterners: function (obj, skip = 0, take = this.conf.pageTake) {
    var that = this;
    that.loading();
    wx.request({
      url: that.conf.server + '/api/parterners?skip=' + skip + '&take=' + take + '&token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res, obj)) {
          obj.setData({
            parterners: res.data.data
          });
          that.hideLoading();
        }
      }
    });
  },
  /**
   * 优惠券列表
   * 传入参数(js对象,获取类型,跳过多少个,一次拿多少个)
   * types获取类型 -1所有 0未使用 1冻结 2已使用 3过期 4作废
   */
  getCoupons: function (obj, types, use_pay = false, skip = 0, take = this.conf.pageTake) {
    var that = this;
    that.loading();
    wx.request({
      url: that.conf.server + '/api/coupons/' + types + '?skip=' + skip + '&take=' + that.conf.pageTake + '&token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res, obj)) {
          that.hideLoading();
          that.conf.coupons = res.data.data;
          obj.setData({
            coupons: that.autoAttachStatusForData(res.data.data),
            couponsTab: parseInt(types),
          });

          if (use_pay) {
            if (that.conf.coupons.length > 0) {
              obj.setData({
                couponStatus: true
              });
            } else {
              that.alert('没有优惠券');
            }

          }

        }
      }
    });
  },
  /**
   * 订单列表
   * types 1全部 2待付款 3待发货 4待确认 5退换货
   */
  getOrdersList: function (obj, types, skip = 0) {
    types = parseInt(types);
    var currentTab = types - 1;
    var that = this;
    that.loading();
    var data = {
      skip: skip,
      take: that.conf.pageTake
    };
    zcjy.request(that, '/api/orders/' + types, function (res) {
      if (!that.errorRes(res, obj)) {
        that.hideLoading();
        //切换类型后要置空然后累加
        if (that.conf.orders.type != types) {
          that.conf.orders.orders = [];
          obj.setData({
            whetherShowMore: false
          })
        }
        if (res.data.data.length == 0) {
          obj.setData({
            whetherShowMore: true
          });
        }
        obj.setData({
          orders: that.autoPushData(that.conf.orders.orders, res.data.data),
          currentTab: currentTab
        });
        //给予对应的状态更新
        that.conf.orders.type = types;
      }
    }, data, true);
  },
  /*
   * 自动拆分合并两个数组或对象
   * 
   */
  autoPushData: function (data, res_data) {
    return zcjy.autoContactArr(data, res_data);
  },
  /**
   * 单个订单详情
   */
  getOrderById: function (obj, order_id) {
    var that = this;
    that.loading();
    wx.request({
      url: that.conf.server + '/api/order/' + order_id + '?token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res, obj)) {
          that.hideLoading();
          obj.setData({
            order: res.data.data
          });
        }
      }
    });
  },
  /**
   * 创建订单
   * 
   */
  payToOrder: function (inputs) {
    var that = this;
    inputs['items'] = JSON.stringify(inputs['items']);//.replace('\\', '')
    wx.request({
      url: that.conf.server + '/api/order/create?token=' + that.globalData.token,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: inputs,
      success: function (res) {
        if (!that.errorRes(res)) {
          console.log('加入订单成功');
          that.meInfo();
          //跳转到订单支付
          wx.redirectTo({
            url: '../orders/order_detail?order_id=' + res.data.data + '&pay_now=true',
          });
          inputs['items'] = JSON.parse(inputs['items']);
          //然后开始把已经勾选的商品删除
          that.dealWithSelectedProduct(inputs['items']);
        }
      }
    });
  },
  /**
   * 处理已经勾选的商品并且更新到购物车(只用在结算创建订单成功后)
   */
  dealWithSelectedProduct: function (items) {
    var that = this;
    //先获取购物车的缓存
    var shopcart = that.getShopCartStorage();
    for (var i in shopcart) {
      for (var k in items) {
        //删除选中的商品
        if (shopcart[i]['id'] == items[k]['id']) {
          shopcart.splice(i, 1);
        }
      }
    }
    console.log(shopcart);
    //然后存入缓存中去
    that.saveShopCartStorage(shopcart);
  },
  /**
   * 验证是true还是false
   */
  varifyDefault: function (status) {
    return zcjy.varifyDefault(status);
  },
  /**
   * 设定默认地址
   * request url:/api/default_address/{address_id}/{default}
   * 
   */
  defaultAddress: function (obj, address_id, status) {
    var that = this;
    that.loading();
    address_id = parseInt(address_id);
    var address_list = that.conf.addressList;
    status = that.varifyDefault(status);

    for (var i = 0; i < address_list.length; i++) {
      if (status) {
        address_list[i]['default'] = false;
      }
      if (parseInt(address_list[i]['id']) == address_id) {
        address_list[i]['default'] = status;
      }
    }
    wx.request({
      url: that.conf.server + '/api/default_address/' + address_id + '/' + status + '?token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res)) {
          obj.setData({
            addressList: address_list
          });
          that.saveStorageName('addressList', address_list);
          that.hideLoading();
        }
      }
    });
  },
  /**
   * 获取商品的收藏状态
   * request url :/api/get_collect/{product_id}
   */
  getProductsStatus: function (obj, product_id) {
    var that = this;
    wx.request({
      url: that.conf.server + '/api/get_collect/' + product_id + '?token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res)) {
          obj.setData({
            collectStatus: that.varifyDefault(res.data.data)
          });
        }
      }
    })
  },
  /**
   * 函数描述:添加收藏 取消收藏
   * 请求url:https://shop-model.yunlike.cn/api/action_collect/{product_id}/{status}
   * 说明：status==true 添加收藏 ==false 取消收藏
   * 传入参数[obj,product_id,status](js对象,商品id,状态)
   * 请求成功更新对应页面的收藏状态
   */
  actionProductsCollect: function (obj, product_id, status, collect_list = '', index = '') {
    var that = this;
    status = that.varifyDefault(status);
    wx.request({
      url: that.conf.server + '/api/action_collect/' + product_id + '/' + status + '?token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res)) {
          if (that.empty(collect_list) && that.empty(index)) {
            obj.setData({
              collectStatus: status
            });
            that.alert(res.data.data);
          } else {
            collect_list.splice(parseInt(index), 1);
            obj.setData({
              products: collect_list
            });
            that.saveStorageName('collections', collect_list);
          }
        }
      }
    });
  },
  /**
   *过滤购物车中未选中的商品并且去除product和spec 
   *返回选中的商品列表
   */
  filterShopCart: function (shopcartlist) {
    var that = this;
    var shoplist = [];
    for (var i in shopcartlist) {
      if (shopcartlist[i]['selected']) {
        shoplist.push({
          id: shopcartlist[i]['id'],
          name: shopcartlist[i]['name'],
          qty: shopcartlist[i]['qty'],
          price: shopcartlist[i]['price'],
          total: shopcartlist[i]['total'],
          types: shopcartlist[i]['types']
        });
      }
    }
    return shoplist;
  },
  /**
   * 获取收藏列表
   * 请求url:https://shop-model.yunlike.cn/api/list_collect
   * 传入参数[obj,skip,take](js对象,跳过多少个,一次取多少个)
   * 请求成功设置对应页面的收藏列表
   */
  getCollectList: function (obj, skip = 0, take = this.conf.pageTake) {
    var that = this;
    that.loading();
    wx.request({
      url: that.conf.server + '/api/list_collect?skip=' + skip + '&take=' + take + '&token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res, obj)) {
          that.hideLoading();
          obj.setData({
            products: res.data.data
          });
          that.saveStorageName('collections', res.data.data);
        }
      }
    });
  },
  /**
   * 取消订单
   */
  cancelOrder: function (order_id, reason) {
    var that = this;
    wx.request({
      url: that.conf.server + '/api/order/cancel/' + order_id + '?reason=' + reason + '&token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.redirectTo({
            url: '../orders/orders',
          });
        }
      }
    });
  },
  /**
   * 用户个人信息
   * 传入参数(js对象)
   */
  meInfo: function (obj = null, callback = null) {
    var that = this;
    that.loading();
    wx.request({
      url: that.conf.server + '/api/me?token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.saveStorageName('myself', res.data.data);
        if (!that.errorRes(res, obj)) {
          that.conf.user = res.data.data;
          if (!that.empty(obj)) {
            obj.setData({
              myself: that.conf.user,
              'themeData.myself': that.conf.user
            });
          } else {
            if (typeof (callback) == 'function') {
              callback(res.data.data);
            }
          }
          that.hideLoading();
        }
      }
    });
  },
  /**
   * 获取系统的高度及宽度
   * 传入参数(js对象)
   * 成功设置对应页面的winWidth和winHeight
   */
  getSystemHeightAndWidth: function (obj = '', is_theme = false) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.winWidth = res.windowWidth;
        that.winHeight = res.windowHeight;
        if (!that.empty(obj)) {
          is_theme ? obj.setData({
            'themeData.winWidth': res.windowWidth,
            'themeData.winHeight': res.windowHeight,
          })
            : obj.setData({
              winWidth: res.windowWidth,
              winHeight: res.windowHeight,
            });

        }
      }
    });
  },
  /**
   * 微信支付
   * 传入参数(js对象,订单id)
   * 成功跳转到订单列表
   */
  wechatPay: function (obj, order_id) {
    var that = this;
    that.loading();
    wx.request({
      url: that.conf.server + '/api/pay_weixin/' + order_id + '?token=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!that.errorRes(res, obj)) {
          that.hideLoading();
          var wechat = JSON.parse(res.data.message);
          console.log(wechat);
          obj.setData({
            wechat: wechat
          });
          wx.requestPayment({
            'appId': wechat.appId,
            'timeStamp': wechat.timeStamp,
            'nonceStr': wechat.nonceStr,
            'package': wechat.package,
            'signType': wechat.signType,
            'paySign': wechat.paySign,
            'success': function (res) {
              console.log(res);
              console.log('调用成功');
              that.alert('支付成功');
              that.meInfo();
              wx.redirectTo({
                url: '../orders/orders',
              });
            },
            'fail': function (res) {
              that.alert('支付失败');
              console.log('调用失败');
            }
          });
        }
      }
    });
  },
  /**
   * 计算长度
   */
  countLength: function (obj) {
    return zcjy.countLength(obj);
  },
  /**
   * 判断是否为空
   */
  empty: function (data) {
    return zcjy.empty(data);
  },
  /**
   * 顶部下拉刷新数据
   */
  onPullDownRefresh: function (obj) {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    console.log('顶部下拉刷新');
    //重新加载一次onload事件
    obj.onLoad();
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  },
  /**
   * 下拉公有回调
   * 函数名称,js对象,跳过多少个(每页取多少个)
   * 返回数量累计
   */
  commonpullUpLoad: function (func_name, obj, skip = this.conf.pageTake, types = '', cat_id = null) {
    if (!obj.data.whetherShowMore) {
      this.loading(1000);
      if (func_name == 'getProducts') {

        this.getProducts(obj, skip);

      } else if (func_name == 'getOrdersList') {
        this.getOrdersList(obj, types, skip);
      } else if (func_name == 'getCoupons') {
        this.getCoupons(obj, types, skip);
      } else if (func_name == 'getParterners') {
        this.getParterners(obj, skip);
      } else if (func_name == 'getCredits') {
        this.getCredits(obj, skip);
      } else if (func_name == 'getCollectList') {
        this.getCollectList(obj, skip);
      } else if (func_name == 'getProductsBycatid') {
        this.getProductsByCatId(obj, cat_id, skip);
      }
    }
    skip += this.conf.pageTake;
    return skip;
  },
  /**
 * 根据小时序列化当前时间
 */
  formatTimeByHour: function (hour) {
    return zcjy.formatTimeByHour(hour);
  },
  /**
   * 验证一下商品的促销类型
   * 秒杀 返回1
   * 拼团 返回5
   * 促销 返回3
   */
  varifyProductPrompType: function (product_obj, promp_obj) {
    var that = this;
    //先看类型
    var type = product_obj.prom_type;

    if (!that.empty(type) && !that.empty(promp_obj)) {
      //秒杀的
      //验证时间
      var now = parseInt(Date.parse(new Date()));

      console.log('now:' + now);

      console.log('time_begin:' + promp_obj.time_begin);

      //开始时间
      var time_begin = parseInt(Date.parse(promp_obj.time_begin));
      console.log('time_begin:' + time_begin);
      console.log('time_begin:' + promp_obj.time_end);

      //结束时间
      var time_end = parseInt(Date.parse(promp_obj.time_end));
      console.log('time_end:' + time_end);

      if (now >= time_begin && now <= time_end) {
        type = product_obj.prom_type;
      } else {
        type = 0;
      }
    }
    console.log('type:' + type);
    return type;
  },
  /**
   * 自动设置缓存时间 到期后清理
   */
  AutoCacheSet: function () {
    return zcjy.removeCache([
      'token',
      'index',
      'cat',
      'myself',
      'addressList',
      'collections',
      'theme',
      'allfunc',
      'founds_cat',
      'founds_post',
      'switch',
      'notices',
      'cats_root'
    ]);
  },
  /**
   * 删除指定缓存
   */
  removeCache: function (cache_arr) {
    return zcjy.removeCache(cache_arr);
  },
  /**
   * 自动验证缓存
   */
  AutoVarifyCache: function (cache_name, callback) {
    return zcjy.AutoVarifyCache(cache_name, callback);
  },
  /**
   * 获取功能开关列表
   */
  getFuncSwithList: function (obj = null, is_theme = false) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/getSystemSettingFunc', function (res) {
      if (!that.errorRes(res)) {
        that.hideLoading();
        that.conf.switch = res.data.data;
        that.saveStorageName('switch', that.conf.switch);
        if (!that.empty(obj)) {
          is_theme
            ?
            obj.setData({
              'themeData.switch': that.conf.switch
            })
            :
            obj.setData({
              switch: that.conf.switch
            });

        }
      }
    });
  },
  /**
   * 处理对应的配置项
   */
  delWithFuncListName: function (funcdata) {
    var list = {};
    for (var i = funcdata.length - 1; i >= 0; i--) {
      var name = funcdata[i].name.toString();
      var val = this.empty(funcdata[i].value.toString()) ? false : true;
      list[name] = val;
    }
    return list;
  },
  /*获取当前页url*/
  getPageUrl: function () {
    return zcjy.getPageUrl();
  },
  /*获取当前页带参数的url*/
  getCurrentPageUrlWithArgs: function () {
    return zcjy.getCurrentPageUrlWithArgs();
  },
  //分享链接跳转
  shareUrlRedirect: function (detail = false, types = null) {
    var that = this;
    var share_obj;
    if (!detail) {
      share_obj = {
        title: that.conf.name,
        desc: that.conf.name,
        path: '/' + that.getPageUrl() + '?shareid=' + that.getStorageName('myself').user.id
      };
    } else {
      share_obj = {
        title: that.conf.name,
        desc: that.conf.name,
        path: '/' + that.getCurrentPageUrlWithArgs() + '&shareid=' + that.getStorageName('myself').user.id
      };
      if (types) {
        share_obj = {
          title: '【' + that.conf.name + '】' + types.product.name,
          desc: '我在' + that.conf.name + '发现了' + types.product.name + ',赶快点开来看看',
          imageUrl: types.product.image,
          path: '/' + that.getCurrentPageUrlWithArgs() + '&shareid=' + that.getStorageName('myself').user.id
        };
      }
    }
    return share_obj;
  },
  //拷贝分享链接到粘贴板
  copyShareLink: function (product_id, shareid) {
    var link = this.conf.server + '/product/' + product_id + 'shareid=' + shareid;
    wx.setClipboardData({
      data: link,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) // data
          }
        })
      }
    });
  },
  //网络图片保存到本地
  saveImgFile: function (imgSrc) {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              wx.downloadFile({
                url: imgSrc,
                success: function (res) {
                  console.log(res);
                  //图片保存到本地
                  wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function (data) {
                      console.log(data);
                    },
                    fail: function (err) {
                      console.log(err);
                      if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                        console.log("用户一开始拒绝了，我们想再次发起授权")
                        console.log('打开设置窗口')
                        wx.openSetting({
                          success(settingdata) {
                            console.log(settingdata)
                            if (settingdata.authSetting['scope.writePhotosAlbum']) {
                              console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                            } else {
                              console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                            }
                          }
                        })
                      }
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
  },
  //分享图片/二维码
  shareImage: function (e) {
    wx.previewImage({
      urls: e.currentTarget.dataset.src.split(',')
      // 需要预览的图片http链接  使用split把字符串转数组。不然会报错  
    })
  },
  //previewImage 预览图片
  previewImage: function (urls, index = 0) {
    wx.previewImage({
      current: urls[index],
      urls: urls
    });
  },
  //绑定推荐关系通过分享id和当前用户的openid
  bindShareRel: function (options) {
    var that = this;
    wx.hideTabBar();
    if (that.empty(options)) {
      options = { 'shareid': null };
    }
    //先验证缓存有没有
    that.AutoVarifyCache('token', function (e) {
      if (!e) {
        that.getUserInfo(options.shareid);
      }
    });
    console.log(options);

    console.log('分享人的id是' + options.shareid + '你的openid是');

  },
  /**
   * 获取主题配置
   */
  getThemeSet: function (callback) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/themeNow', function (res) {
      if (!that.errorRes(res)) {
        that.hideLoading();
        callback(res);
        that.saveStorageName('theme', res.data.data);
      }
    });
  },
  /**
   * 获取颜色设置
   */
  getColorSet: function (obj = null, callback) {
    var that = this;
    that.AutoVarifyCache('theme', function (e) {
      if (!e) {
        that.getThemeSet(function (res) {
          if (!that.empty(obj)) {
            obj.setData({
              'themeData.maincolor': res.maincolor,
              'themeData.secondcolor': res.secondcolor,
              maincolor: res.maincolor,
              secondcolor: res.secondcolor
            });
          }
          var res = { maincolor: res.maincolor, secondcolor: res.secondcolor }
          if (typeof (callback) == 'function') {
            callback(res);
          }
        });
      } else {
        if (!that.empty(obj)) {
          obj.setData({
            'themeData.maincolor': e.maincolor,
            'themeData.secondcolor': e.secondcolor,
            maincolor: e.maincolor,
            secondcolor: e.secondcolor
          });
        }
        var res = { maincolor: e.maincolor, secondcolor: e.secondcolor }
        if (typeof (callback) == 'function') {
          callback(res);
        }
      }
    });
  },
  /**
   * 获取所有配置项
   */
  getAllFunc: function (callback) {
    var that = this;
    that.loading();
    zcjy.request(that, '/api/getAllFunc', function (res) {
      if (!that.errorRes(res)) {
        that.hideLoading();
        that.saveStorageName('allfunc', res.data.data);
        if (typeof (callback) == 'function') {
          callback(res.data.data);
        }
      }
    });
  },
  //从多维数组中通过一个关键key找到对应的value并且做对应的操作
  getArrValueByKey: function (key, val, callback) {
    return zcjy.getArrValueByKey(key, val, callback);
  },
  //获取指定的tabbar 并且让指定的tab高亮
  setTabBar: function (tab_theme_name, obj) {
    var that = this;
    //从配置中读取对应主题的tabbar
    var tabbar = that.tabBar[0][tab_theme_name];
    //把购物车得数量加上去
    that.AutoVarifyCache('ShopCart', function (e) {
      if (!e) {
        tabbar.num = e.length;
      }

    });
    that.tabBar[0][tab_theme_name] = tabbar;
    // console.log(that.tabBar[0]);
    var list = tabbar['list'];
    for (var i = tabbar['list'].length - 1; i >= 0; i--) {
      //如果tabbar中配置的路径和当前的路径一致就加上active状态
      if (that.isContains(tabbar['list'][i]['pagePath'], that.getPageUrl())) {
        tabbar['list'][i]['active'] = true;
        //console.log('tabbar:'+i+'高亮');
      }//然后把其他的tabbar重置下
      else {
        tabbar['list'][i]['active'] = false;
      }
    }

    obj.setData({
      'themeData.tabBar': tabbar,
      tabBar: tabbar
    });
  },
  //获取单页列表
  getSinglePageList: function (obj, use_index = false, callback) {
    var that = this;
    zcjy.request(that, '/api/single_page_list', function (res) {
      if (!that.errorRes(res)) {
        if (use_index) {
          res.data.data[0]['site_name'] = obj.data.themeData.name;
        }
        obj.setData({
          'themeData.pagelist': res.data.data,
          pagelist: res.data.data
        });
        if (typeof (callback) == 'function') {
          callback(res.data.data);
        }
      }
    });
  },
  /**
   * 获取话题分类列表
   **/
  getFoundsCats: function (obj) {
    var that = this;
    zcjy.request(that, '/api/post_cat_all', function (res) {
      if (!that.errorRes(res)) {
        obj.setData({
          'themeData.post_cat_all': res.data.data
        });
        //同时发起全部图片的加载
        that.startManyImagesLoad(obj.data.themeData.post_cat_all, obj);
        that.saveStorageName('founds_cat', res.data.data);
      }
    });
  },
  /**
   * 获取话题文章
   **/
  getFoundsPosts: function (obj, is_hot = 0, types = 0, use_drop = false, skip = 0, take = this.conf.pageTake) {
    //如果重置就不能继续请求
    if (obj.data.themeData.whetherShowMore) {
      ///return false;
    }
    var that = this;
    //请求数据
    var api_data = {
      skip: skip,
      take: take,
      is_hot: is_hot
    };
    zcjy.request(that, '/api/post_found/' + types, function (res) {
      if (!that.errorRes(res)) {
        //如果没有数据就提示啦
        if (res.data.data.length == 0) {
          use_drop ?
            obj.setData({
              'themeData.whetherShowMore': true
            }) : obj.setData({
              'themeData.whetherShowMore': true,
              'themeData.post_found': []
            });
          return false;
        }

        //转换内容
        for (var i = res.data.data.length - 1; i >= 0; i--) {
          res.data.data[i]['content'] = res.data.data[i]['content'].replace('<p>', '');
          res.data.data[i]['content'] = res.data.data[i]['content'].replace('</p>', '');
        }
        //如果要使用到下拉加载
        if (use_drop) {
          obj.setData({
            'themeData.post_found': that.autoPushData(that.conf.found.posts, res.data.data)
          });
        }
        //默认的话
        else {
          //WxParse.wxParse('themeData.contents['+i+']', 'html', obj.data.themeData.post_found[i]['content'], obj, 5)

          obj.setData({
            'themeData.post_found': res.data.data
          });

          if (!is_hot && !types) {
            that.saveStorageName('founds_post', res.data.data);
          }

        }
        //for (var i = 0; i < obj.data.themeData.post_found.length;i++){
        //同时发起全部图片的加载
        //that.startManyImagesLoad(obj.data.themeData.post_found[i].images, obj);
        //}

      }
    }, api_data);

  },
  //html解析成小程序view
  WxParse: function (view_data, html, format_data, obj, types = 5) {
    return WxParse.wxParse(view_data, html, format_data, obj, types);
  },
  //用户分享二维码
  shareCodes: function (user_id) {
    return (this.conf.server + '/qrcodes/user_share' + user_id + '.png');
  },
  getShareCodeById: function (obj, user_id) {
    var that = this;
    zcjy.request(that, '/api/mini_program/product_code?user_id=' + res.user.id + '&token=' + that.globalData.token, function (res) {
      if (!that.errorRes(res, obj)) {
        obj.setData({
          product_code: 'https://shop-model.yunlike.cn' + res.data.user_id + '.png'
        })
      }
    })
  },
  //绑定图片预加载插件
  bindImageLoad: function (obj) {
    //return obj.imgLoader = new ImgLoader(obj, obj.imageOnLoad.bind(obj));
  },
  //预加载图片
  loadImages(obj, type = "allproduct") {
    var that = this;
    if (type == "allproduct") {
      var allProduct = obj.data.themeData.allProduct;
      //同时发起全部图片的加载

      //that.imgLoader.load(item.image)

    }
  },
  //获取分享二维码
  getShareCode: function (obj) {
    var that = this;
    zcjy.request(that, '/api/mini_program/distribution_code', function (res) {
      if (!that.errorRes(res)) {
        console.log(res.data.data);
        obj.setData({
          user_share_code: that.conf.server + res.data.data
        });
      }
    }, {}, true);
  },
  //首页搜索框 商品搜索
  searchProducts: function (obj, word) {
    var that = this;
    var data = { query: word };
    //商品搜索详情
    zcjy.request(that, '/api/product_search', function (res) {
      if (!that.errorRes(res)) {
        obj.setData({
          'themeData.search_product_list': res.data.data,
          'themeData.search_val': word
        });
      }
    }, data);
  },
  //获取通知消息
  getNotices: function (obj, use_notice = false) {
    var that = this;
    zcjy.request(that, '/api/getNotices', function (res) {
      if (!that.errorRes(res)) {
        obj.setData({
          'themeData.notices': res.data.data
        });
        that.saveStorageName('notices', res.data.data);
        use_notice ? WxParse.wxParse('contents', 'html', that.conf.product.products.product.intro, obj, 5) : '';
      }
    });
  },
  // 根据消息id获取对应消息
  //获取可用的优惠券列表
  getCanUseCoupons: function (obj, inputs) {
    var that = this;
    inputs['items'] = JSON.stringify(inputs['items']);
    zcjy.request(that, '/api/coupons_canuse', function (res) {
      if (!that.errorRes(res)) {
        obj.setData({
          coupons: res.data.data,
        });
        if (res.data.data.length > 0) {
          obj.setData({
            couponStatus: true
          });
        } else {
          that.alert('没有优惠券');
        }
      }
    }, inputs, true, 'GET', true);
  },
  //选择单个优惠券
  selectOneCoupon: function (coupon_id, obj, inputs) {
    var that = this;
    inputs['items'] = JSON.stringify(inputs['items']);
    zcjy.request(that, '/api/coupons_use/' + coupon_id, function (res) {

      if (!that.errorRes(res)) {
        if (res.data.data.code == 0) {
          obj.setData({
            // coupons: res.data.message,
            couponStatus: false,
            couponUse: true,
            couponPrice: res.data.data.message.discount,
            coupon_id: res.data.data.message.coupon_id
          });
          //初始化结算金额
          obj.setNeedPay();
        }
        else {
          that.alert(res.data.data.message);
        }

      }

    }, inputs, true, 'GET', true);
  },
  //计算优惠价格
  cartPreference: function (obj, inputs, callback = null) {
    var that = this;
    inputs['items'] = JSON.stringify(inputs['items']);
    zcjy.request(that, '/api/cart/preference', function (res) {
      if (!that.errorRes(res)) {
        var myselfs = that.getStorageName("myself");
        obj.setData({
          cart: res.data.data,
          myself: myselfs,
          'themeData.myself': myselfs
        });
        callback(res.data.data, myselfs);
        //初始化金额
        obj.setNeedPay();
      }
    }, inputs, true, 'GET', true);
  },
  //正在进行的活动
  productPromp: function (obj) {
    var that = this;
    zcjy.request(that, '/api/product_proms', function (res) {
      if (!that.errorRes(res)) {
        obj.setData({
          product_proms: res.data.data
        });
      }
    });
  },
  //活动详情
  productPrompDetail: function (obj, id, skip = 0,take = this.conf.pageTake) {
    var that=this;
    let _product_proms_list;
    let request_data= {skip:skip,take:take};
    zcjy.request(this, '/api/product_proms/' + id, function (res) {
      if(res.data.data.length == 0) {
        that.hideLoading();
        obj.data.whetherShowMore = true;
        obj.setData({
          'themeData.whetherShowMore': true
        });
        return;
      }
      _product_proms_list=res.data.data;
      console.log(_product_proms_list);
      for (var i = _product_proms_list.length - 1; i >= 0; i--) {
        _product_proms_list[i]['maincolor'] = obj.data.themeData.maincolor;
      }
      // if (!this.errorRes(res)) {
        obj.setData({
          product_proms_list: that.autoPushData(obj.data.product_proms_list,_product_proms_list)
        });
      // }
        //同时发起全部图片的加载
        that.startManyImagesLoad(_product_proms_list, obj);
    }, request_data);
  },
  //通过要遍历的图像对象及获取的参数来缓加载图片
  varifyImageLazyLoaded: function (foreach_element, src, image_word, callback, types = null) {
    var that = this;
    if (typeof (foreach_element) !== 'undefined' && foreach_element.length > 0) {
      for (var i = 0; i < foreach_element.length; i++) {
        if (foreach_element[i][image_word] == src) {
          foreach_element[i]['loaded'] = true
          // if (types == 'allProduct') {
          //   that.conf.index.allProduct[i]['loaded'] = true
          // }
          // else if (types == 'productsOnly'){
          //   that.conf.index.productsOnly[i]['loaded'] = true
          // }
        }
      }
      callback(foreach_element);
    }
  },
  //同时发起多张图片缓加载
  startManyImagesLoad: function (loaded_element, obj, keyword = 'image') {
    //同时发起全部图片的加载
    loaded_element.forEach(
      item => {
        obj.imgLoader.load(item[keyword])
      }
    );
  },
  //跳转到订单物流查询
  searchOrderList: function (types, post_id) {
    wx.redirectTo({
      url: '../webview/webview?url=' + this.conf.server + '/webview/logistics?type=' + types + '&postid=' + post_id
    })
  },
  //最新版本上线及时更新
  getUpdatestApp: function () {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })

    });

    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    });
  },
  attachMainColorByProduct: function (_product){
    let _color = "#000";
    this.getColorSet(null, function (res) {
      _color = res.maincolor;
    });
    for (var i = _product.length - 1; i >= 0; i--) {
      _product[i]['maincolor'] = _color;
    }
    return _product;
  },
  //运费计算
  //系统宽度
  winWidth: '',
  //系统高度
  winHeight: '',
  load: false,
  conf: {
    //公司芸来商城
    //亲爱的全球GO
    name: '亲爱的全球GO',
    //略缩图
    default_img: '../../images/default.png',
    //功能开关
    switch: {
      //品牌街
      FUNC_BRAND: false,
      //商品促销
      FUNC_PRODUCT_PROMP: true,
      //订单优惠
      FUNC_ORDER_PROMP: false,
      //订单取消
      FUNC_ORDER_CANCEL: false,
      //退换货
      FUNC_AFTERSALE: false,
      //秒杀
      FUNC_FLASHSALE: true,
      //拼团
      FUNC_TEAMSALE: false,
      //优惠券
      FUNC_COUPON: false,
      //积分
      FUNC_CREDITS: false,
      //余额
      FUNC_FUNDS: false,
      //分销
      FUNC_DISTRIBUTION: false,
      //提现
      FUNC_CASH_WITHDRWA: false,
      //会员等级
      FUNC_MEMBER_LEVEL: false,
      //开发票
      FUNC_FAPIAO: false,
      //页面底部信息
      FUNC_FOOTER: false,
      //商品收藏
      FUNC_COLLECT: false,
      //显示技术支持
      FUNC_YUNLIKE: false,
      //微信支付
      FUNC_WECHATPAY: false,
      //微信(个人)支付
      FUNC_PAYSAPI: false,
      //支付宝支付
      FUNC_ALIPAY: false
    },
    //用户可用的优惠券
    coupons: [],
    //用户个人信息
    user: {
      userLevel: {
        name: '会员'
      }
    },
    //加载动画延迟时间
    delay_time: 800,
    //缓存时间[购物车 用户中心 地址 用缓存] 单位分钟
    cachetime: 15,
    //地址列表
    addressList: [],
    //每页显示数量
    pageTake: 30,
    //是否马上结算
    checknow: false,
    theme: 'social',
    //主题状态
    themeStatus: true,
    themeParent: 'default',
    //主题颜色
    themeColor: '#ff4e44',
    //token定时取时间
    tokenTime: 30,
    //服务器请求基本地址 'http://10.10.6.6/ShangDianV5.5/public'
    //公司商城地址: 'https://shop-model.yunlike.cn'
    // 亲爱的全球购地址:'https://quanqiugo.club'
    // 朵拉：'https://www.dorabuy.com'
    server: 'https://quanqiugo.club',
    //小程序appid  'wx02c2a117dc439ac3'
    //公司  wx51ab71ac2b03db3c
    //全球购  wx5669b891f3e907a7
    // 朵拉 wx6acc01c82a7e5461
    appid: 'wx5669b891f3e907a7',
    //小程序secret 'cbea2a5a385b72c0cfaf4708e17c4b7f',
    //公司a2061cd4ddd846c22161939f08e6b25b
    // 全球购secret 59d28e294ceadc925ecdb31891795f81
    // 朵拉诚品 e8a9f003fbf8a1b9fd57b45f0f13f392
    secret: '59d28e294ceadc925ecdb31891795f81',
    //首页
    index: {
      //首页横幅
      indexBanner: null,
      //推荐分类
      catRecommend: null,
      //新品推荐
      newProduct: null,
      //拼团商品 //促销商品
      team_sale_product: null,
      //秒杀商品 //促销商品
      flash_sale_product: null,
      //全部产品
      allProduct: [],
      //分类商品
      catProduct: [],
      productsOnly:[],
      sales_count_products:[]
    },
    //所有分类页面
    cat: null,
    //子分类带商品页面
    category: {
      currentCatId: null,
      currentChildCat: null,
      currentProduct: null,
    },
    //产品页面
    product: {
      products: null,
      fav_product_list: null
    },
    orders: {
      orders: [],
      type: 1
    },
    //购物车列表
    shopCartList: [],
    //单个购物车结构
    shopCartItem: [
      {
        id: '',//product_id _ spec_id
        name: '',//product_name spec_key_name
        qty: '',//数量默认是1
        price: "",//单价
        total: "",//总计多少钱
        types: "",//类型0不带规格 1带规格
        product: '',//加入的商品
        spec: '',//加入的规格信息
        selected: true
      }
    ],
    //发现
    found: {
      posts: [],
      posts_hot: []
    },
    //服务器请求超时时间
    "networkTimeout": {
      "request": 20000,
      "connectSocket": 20000,
      "uploadFile": 20000,
      "downloadFile": 20000
    }
  },
  shopCartList: [],
  //常用数据
  globalData: {
    hasLogin: false,
    userOpenId: null,
    userInfo: null,
    token: null,
    userUnionId: null,
  },
  //略缩图:
  imgThumb: 'http://storage.360buyimg.com/mtd/home/lion1483683731203.jpg',
  tabBar: [
    {
      default: {
        "color": "#999",
        "selectedColor": "#ff4e44",
        "borderStyle": "white",
        "backgroundColor": "#f9f9f9",
        "position": "bottom",
        "list": [
          {
            "text": "首页",
            "pagePath": "/pages/index/index",
            "iconPath": "../../images/default/index/indexdefult.png",
            "selectedIconPath": "../../images/default/index/index.png",
            "active": false
          },
          {
            "text": "商品",
            "pagePath": "/pages/cat/cat",
            "iconPath": "../../images/default/index/startdefult.png",
            "selectedIconPath": "../../images/default/index/start.png",
            "active": false
          },
          {
            "text": "购物车",
            "pagePath": "/pages/shop_cart/shop_cart",
            "iconPath": "../../images/default/index/cartdefult.png",
            "selectedIconPath": "../../images/default/index/cart.png",
            "active": false
          },
          {
            "text": "个人中心",
            "pagePath": "/pages/myself/myself",
            "iconPath": "../../images/default/index/userdefult.png",
            "selectedIconPath": "../../images/default/index/user.png",
            "active": false
          }
        ],
        "num": 0
      },
      social: {
        "color": "#999",
        "selectedColor": "#fff",
        "borderStyle": "white",
        "backgroundColor": "#000",
        "position": "bottom",
        "list": [
          {
            "text": "首页",
            "pagePath": "/pages/index/index",
            "iconPath": "../../images/social/t7.png",
            "selectedIconPath": "../../images/social/t1.png",
            "active": false
          },
          {
            "text": "发现",
            "pagePath": "/pages/found/found",
            "iconPath": "../../images/social/t2.png",
            "selectedIconPath": "../../images/social/t5.png",
            "active": false
          },
          {
            "text": "购物车",
            "pagePath": "/pages/shop_cart/shop_cart",
            "iconPath": "../../images/social/t3.png",
            "selectedIconPath": "../../images/social/t3.png",
            "active": false
          },
          {
            "text": "个人中心",
            "pagePath": "/pages/myself/myself",
            "iconPath": "../../images/social/t4.png",
            "selectedIconPath": "../../images/social/t6.png",
            "active": false
          }
        ],
        "num": 0
      }
    }],
})
