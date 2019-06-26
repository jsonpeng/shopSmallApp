// pages/product/product.js  
var app = getApp();
const ImgLoader = require('../../template/common/img-loader/img-loader.js');
Page({
  data: {
    fav_product_list: null,
    products: null,
    key: '',//用于本地存储的键
    data: '',//用于本地存储的值
    theme: '',
    themeData: {},
    imgUrls: [],
    winHeight: app.winHeight,
    winWidth: 0,
    indicatorDots: true, //是否显示面板指示点，默认为false;
    //autoplay: true, //是否自动切换，默认为false;
    //interval: 3000,//自动切换时间间隔，默认5000ms;
    circular: true,//是否采用衔接滑动
    duration: 1000,//滑动动画时长，默认为1000ms;
    currentTab: 0, //tab切换
    canShowShop: false,
    timer: [0, 0, 0],
    specsTab: 0,
    currentNum: 1,
    specItemId: [],
    flag: true,
    shopCartList: [],
    collectStatus: false,
    product_id: 0,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    flag1: false,
    flag2: true,
    selected: true,
    selected1: false,
    prom_type: 0, //促销类型
    themeName: '',//主题名
    ifShowCode: false,
    sharePic: '',
    pageScroll: false
  },
  /**
   * 页面的初始数据
   */
  show: function () {
    this.setData({ flag: false, });
  },
  hide: function () {
    this.setData({ flag: true });
  },
  downLoadImg: function (netUrl, storageKeyUrl) {
    wx.getImageInfo({
      src: netUrl,    //请求的网络图片路径
      success: function (res) {
        //请求成功后将会生成一个本地路径即res.path,然后将该路径缓存到storageKeyUrl关键字中
        wx.setStorage({
          key: storageKeyUrl,
          data: res.path,
        });

      }
    })
  },
  showCode: function () {
    wx.showToast({
      title: '图片生成中...',
      duration: 5000,
    });
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWID: res.windowWidth - 30,
          windowHEI: res.windowHeight * 0.9
        })
      }
    });
    setTimeout(function () {
      that.setData({
        ifShowCode: true
      });
    }, 5500) //延迟时间 这里是5.5秒  
    // 绘制分享图片
    var context = wx.createCanvasContext('shareCanvas');
    var path = "../../images/share-prod.png";
    var userImg = that.data.myself.user.head_image;
    var usrName = that.data.myself.user.nickname;
    var proName = that.data.products.product.name;
    var wordsNum = parseInt(that.data.windowWID / 14);
    var proName1 = proName.slice(0, wordsNum);
    var proName2 = proName.slice(wordsNum);
    var proPic = that.data.products.product.image;
    var proCode = that.data.product_code;
    var code = "../../images/default/white-print.png";
    console.log('可显示字数为' + proCode);
    console.log('用户名' + usrName);
    context.stroke;
    context.drawImage(path, 15, 0, that.data.windowWID, that.data.windowHEI * 0.9);
    // 用户头像  
    that.downLoadImg(userImg, 'uImg')
    var _userImg = wx.getStorageSync('uImg');
    context.drawImage(_userImg, that.data.windowWID / 2 - 65, 45, 65, 65);
    // 用户名
    context.setFillStyle('#fff');
    context.setTextAlign('left');
    context.setFontSize(15);
    context.fillText(usrName, that.data.windowWID / 2 + 15, 70, );

    context.setFillStyle('#fff');
    context.setTextAlign('left');
    context.setFontSize(14);
    context.fillText('给你发送一个好物', that.data.windowWID / 2 + 15, 90, );
    // 商品名
    context.setFillStyle('#fff');
    context.setTextAlign('left');
    context.setFontSize(15);
    context.fillText(proName1, 15 + 15, 150, );
    context.fillText(proName2, 15 + 15, 170, );
    // 商品图
    that.downLoadImg(proPic, 'ProdImg');
    var _proPic = wx.getStorageSync('ProdImg');
    context.drawImage(_proPic, that.data.windowWID / 2 - 65, 200, 150, 150);
    // 商品二维码
    that.downLoadImg(proCode, 'productCode');
    var _proCode = wx.getStorageSync('productCode');
    context.drawImage(_proCode, that.data.windowWID / 2 - 65, that.data.windowHEI * 0.9 - 115, 65, 65);
    // 指纹图片
    context.drawImage(code, that.data.windowWID / 2 + 15, that.data.windowHEI * 0.9 - 115, 65, 65);
    // 底部文字
    context.setFillStyle('#fff');
    context.setTextAlign('center');
    context.setFontSize(14);
    context.fillText('长按识别小程序码进行购买', that.data.windowWID / 2 + 15, that.data.windowHEI * 0.9 - 20);

    context.draw();

  },
  hideCode: function () {
    this.setData({
      ifShowCode: false
    })
  },
  // 保存分享图片到本地相册
  //获取临时路径
  // 保存至相册
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
          success: function (res) {
            wx.showToast({
              title: '保存成功',
              duration: 1500,
            })
          },
          fail: function (res) {
            console.log(res)
            if (res.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
              console.log("打开设置窗口");
              wx.openSetting({
                success(settingdata) {
                  console.log(settingdata)
                  if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                    console.log("获取权限成功，再次点击图片保存到相册")
                  } else {
                    console.log("获取权限失败")
                  }
                }
              })
            }
          }
        })
        console.log("生成的图片路径为" + that.data.sharePic);
      }
    })
  },
  // 分享二维码弹出层

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.imgLoader = new ImgLoader(this, this.imageOnLoad.bind(this));
    var that = this;
    var product_id;
    console.log("options为：" + options);
    if (typeof (options.product_id) != 'undefined') {
      product_id = options.product_id;
    }
    else {
      var scene = decodeURIComponent(options.scene);
      var scene_arr = scene.split('&');
      product_id = scene_arr[1].slice(11);
      options['shareid'] = scene_arr[0].slice(8);
      console.log('product_id' + product_id + ',shareid' + options['shareid']);
    }
    console.log(options);
    app.bindShareRel(options);
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
    // 获取主题名
    app.AutoVarifyCache('theme', function (e) {
      if (!e) {
        app.getThemeSet(function (res) {
          that.setData({
            'themeData.themeName': res.data.data,
          });
          console.log(res.data.data.name);
        });
      } else {
        that.setData({
          'themeData.themeName': e,
        });
        //console.log('这是' + e.name);
      }

    });
    //获取个人信息
    app.AutoVarifyCache('myself', function (e) {
      if (!e) {
        app.meInfo(that);
      } else {
        that.setData({
          myself: e
        });
      }
    });

    app.getProductContentById(that, product_id);
    app.getProductsStatus(that, product_id);
    app.getProductsCodeById(that, product_id);
    setTimeout(function () {
      app.getFavProductById(that, product_id);
    }, 500);
    that.setData({
      shopCartList: app.conf.shopCartList
    });

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }

    });

  },
  imageOnLoad: function (err, data) {
    var that = this;
    console.log('图片加载完成', err, data.src);
    app.varifyImageLazyLoaded(this.data.products.images, data.src, 'url', function (res) {
      that.setData({ 'products.images': res })
    });
  },
  //添加收藏与取消收藏
  collectAction: function (e) {
    var status = app.varifyDefault(e.currentTarget.dataset.status);
    app.actionProductsCollect(this, this.data.product_id, !status);
  },
  /**
   * 切换规格
   */
  switchSpecTab: function (e) {
    var that = this;
    //第一层数组的位置
    var index1 = e.currentTarget.dataset.tabparent;
    //第二层数组的位置
    var index2 = e.currentTarget.dataset.tab;
    var products = that.data.products;
    //先重置状态
    products.specs = app.switchSpecStatus(products.specs, index1, index2);
    //然后找key
    var key = app.autoCombSpecKey(products.specs);
    //找到key再找对应的speceprice的数组位置
    var specsTab = parseInt(app.findSpecPriceIndex(that.data.products.spec_goods_prices, key));
    that.setData({
      products: products,
      //重置数量
      currentNum: 1,
      specsTab: specsTab
    });
  },

  /**
   * 点击减号
   */
  numDel: function () {
    //当前的实际数量
    var currentNum = parseInt(this.data.currentNum);
    //当前规格的位置
    var specsTab = this.data.specsTab;
    if (currentNum > 1) {
      currentNum--;
    }
    this.setData({
      currentNum: currentNum
    });
  },
  /**
   * 点击加号
   */
  numAdd: function () {
    //当前的实际数量
    var currentNum = parseInt(this.data.currentNum);
    //当前规格的位置
    var specsTab = this.data.specsTab;
    //商品是否带规格
    var varify = this.data.products.specs.length == 0 ? true : false;
    //不带规格信息的算原商品的库存
    //带规格信息的算当前切换的商品的库存
    var inventory = parseInt(varify ? this.data.products.product.inventory : this.data.products.spec_goods_prices[specsTab]['inventory']);
    if (currentNum < inventory || inventory < 0) {
      currentNum++;
    } else {
      wx.showModal({
        // title: '芸来商城提示',
        content: '购买数量不能大于该商品的库存',
        showCancel: false,
      });
    }
    this.setData({
      currentNum: currentNum
    });
  },
  /**
   * input输入
   */
  numInput: function (e) {
    //当前的实际数量
    var currentNum = parseInt(this.data.currentNum);
    //当前规格的位置
    var specsTab = this.data.specsTab;
    //商品是否带规格
    var varify = this.data.products.specs.length == 0 ? true : false;
    //不带规格信息的算原商品的库存
    //带规格信息的算当前切换的商品的库存
    var inventory = parseInt(varify ? this.data.products.product.inventory : this.data.products.spec_goods_prices[specsTab]['inventory']);
    currentNum = parseInt(e.detail.value);

    if (currentNum > inventory && inventory >= 0) {
      wx.showModal({
        // title: '芸来商城提示',
        content: '购买数量不能大于该商品的库存',
        showCancel: false,
      });
      currentNum = parseInt(this.data.currentNum);
    }

    this.setData({
      currentNum: currentNum
    });
  },
  //添加到购物车
  addCart: function (e) {
    var that = this;
    var buynow = app.varifyDefault(e.currentTarget.dataset.buynow);
    var product = this.data.products.product;
    var spec = this.data.products.specs.length == 0 ? [] : this.data.products.spec_goods_prices[this.data.specsTab];
    var currentNum = this.data.currentNum;

    var shop_item = app.conf.shopCartItem;
    var num = parseInt(currentNum);
    var product_spec_id;
    var shop_list;
    //console.log(spec.length)
    //如果是不带规格的商品
    if (spec.length == 0) {
      shop_item[0]['id'] = product.id + '_0';
      product_spec_id = product.id;
      shop_item[0]['name'] = product.name;
      shop_item[0]['qty'] = num;
      shop_item[0]['price'] = product.realPrice;
      shop_item[0]['types'] = 0;
      shop_item[0]['total'] = product.realPrice * num;
    } else {
      //如果是带规格的商品
      shop_item[0]['id'] = product.id + '_' + spec.id;
      product_spec_id = product.id + '_' + spec.id;
      shop_item[0]['name'] = product.name;
      shop_item[0]['qty'] = num;
      shop_item[0]['price'] = spec.realPrice;
      shop_item[0]['types'] = 1;
      shop_item[0]['total'] = spec.realPrice * num;
    }
    shop_item[0]['product'] = product;
    shop_item[0]['spec'] = spec;

    var shopList = app.getShopCartStorage();
    shopList = app.mergeCart(shopList, shop_item[0]);
    this.setData({
      shopCartList: shopList
    });


    app.saveShopCartStorage(shopList);

    app.conf.shopCartList = shopList;
    //console.log(shopList);
    console.log(buynow);
    if (!buynow) {
      wx.showModal({
        // title: '芸来商城提示',
        content: '已为您添加到购物车',
        cancelText: '继续购物',
        confirmText: '去结算',
        confirmColor: '#ff4e44',
        success: function (res) {
          if (res.confirm) {
            console.log('去结算');
            wx.switchTab({
              url: '../shop_cart/shop_cart',
            })
            // wx.redirectTo({
            //   url: '../shop_cart/shop_cart',
            // });
          } else if (res.cancel) {
            console.log('继续购物');
            that.hide();
          }
        }
      });
    } else {
      console.log('立即购买');
      wx.switchTab({
        url: '../shop_cart/shop_cart',
      })
    }

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (res) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {


  },
  showflag1: function () {
    this.setData({ flag1: false, flag2: true });
  },
  showflag2: function () {
    this.setData({ flag2: false, flag1: true });
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
   * 页面上拉触底事件的处理函数  上拉加载商品详情
   */
  onReachBottom: function () {
      console.log('开始加载详情');
        this.setData({
          pageScroll: true,
          flag1: true
        })

  },
  // 页面滚动监听
  onPageScroll: function () {
    console.log('页面滚动');
    this.setData({
      pageScroll: true,
      flag1: true
    })
    // Do something when page scroll
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log(app.shareUrlRedirect(true, this.data.products));
    return app.shareUrlRedirect(true, this.data.products);
  },
  selected: function (e) {
    this.setData({
      selected1: false,
      selected: true
    })
    wx.pageScrollTo({
      scrollTop: 0
    })
  },

  selected1: function (e) {
    this.setData({
      selected: false,
      selected1: true,
      pageScroll: true,
      flag1: true
    });
    setTimeout(function () {
      wx.pageScrollTo({
        scrollTop: 551.5
      })
    }, 300)

  },



})