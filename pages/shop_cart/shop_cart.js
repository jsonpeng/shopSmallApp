var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    user:app.conf.user,
    openTimes:0,
    hadProduct:true,//用来判断购物车中是否有商品加入
    winWidth: 0,
    winHeight: 0,
    allNum:0,//商品结算总数量
    allCount:0,//商品合计多少
    allTab:[],
    selectedAllStatus:false,//全选
    editState: false,//编辑状态
    shopCartList: [{
      id: '',//product_id _ spec_id
      name: '1',//product_name spec_key_name
      qty: 1,//数量默认是1
      price: 1,//单价
      total: 1,//总计多少钱
      types:1,//类型0不带规格 1带规格
      product:{inventory:10},//加入的商品
      spec:{inventory: 12 },//加入的规格信息
    }, {
      id: '',//product_id _ spec_id
      name: '1',//product_name spec_key_name
      qty: 1,//数量默认是1
      price: 22,//单价
      total: 1,//总计多少钱
      types: 1,//类型0不带规格 1带规格
      product: { inventory: 10 },//加入的商品
      spec: { inventory: 12 },//加入的规格信息
      }, {
        id: '',//product_id _ spec_id
        name: '22',//product_name spec_key_name
        qty: 1,//数量默认是1
        price: 24,//单价
        total: 1,//总计多少钱
        types: 1,//类型0不带规格 1带规格
        product: { inventory: 10 },//加入的商品
        spec: { inventory: 12 },//加入的规格信息
      }],
    product:null,
  },
  /**
   * 根据购物车列表对象
   * 计算购物车的总价及数量[shopCartList OBJECT](购车车列表对象)
   */
  countAllNumAndPrice: function (shopCartList){
    var allNum =0;
    var allCount = 0;
    for (var i = 0; i < shopCartList.length;i++){
      //只有选中的才算入
      if (shopCartList[i]['selected']){
        shopCartList[i]['qty'] == '' || shopCartList[i]['qty'] == 'null' || isNaN(shopCartList[i]['qty']) || shopCartList[i]['qty'] == NaN ? shopCartList[i]['qty'] = 0 : shopCartList[i]['qty'] =parseInt(shopCartList[i]['qty']);
          console.log(shopCartList[i]['qty']);
          allNum += shopCartList[i]['qty']
          allCount += shopCartList[i]['qty'] * shopCartList[i]['price'];
          //再算一次综合
          shopCartList[i]['total'] = shopCartList[i]['qty'] * shopCartList[i]['price'];
      }
    }
    this.setData({
      allNum: allNum,
      allCount:allCount,
      shopCartList: shopCartList
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //绑定分享关系
    app.bindShareRel(options);
    app.getColorSet(this);
  },
  onShow: function () {
    var that = this;
    //app.meInfo(that);
    var status = false;
    //从缓存中读取购物车列表
    var shopCartList = app.getShopCartStorage();
    //大于0就显示商品
    if (shopCartList.length > 0) {
      status = true;
    }
    that.setData({
      hadProduct: status,
      shopCartList: shopCartList
    });
    //大于0就统计商品总价
    if (status) {
      that.countAllNumAndPrice(shopCartList);
    }
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
  //开始编辑
  shopEdit:function(e){
    var shopCart = this.data.shopCart;
    for (var i = 0; i < shopCart.length;i++){
    shopCart[i].selected = false;
    }
    this.setData({
      editState: true,
      selectedAllStatus: false,
      shopCart: shopCart
    });
  },
//结束编辑
shopEditFinish:function(e){
  this.setData({
    editState: false
  });
},
//单选商品
checkSelected:function(e){
  console.log("单选：开始");
  var shopCartList = this.data.shopCartList;
  //商品在购物车中的顺序
  var index = parseInt(e.currentTarget.dataset.index);
  var selected = shopCartList[index]['selected'];
  console.log(selected);
  shopCartList[index]['selected'] = !shopCartList[index]['selected'];
  app.saveShopCartStorage(shopCartList);
  //重新计算价格
  this.countAllNumAndPrice(shopCartList);
},
 //点击减号
 numDel: function (e) {
   var shopCartList = this.data.shopCartList;
   //商品在购物车中的顺序
   var index = parseInt(e.currentTarget.dataset.index);
   var num = shopCartList[index]['qty'];
   console.log("点击减号");
   //只有在数量大于0的情况下点击减号生效
   if (num > 1) {
     num--;
   }
   shopCartList[index]['qty']=num;
   //重新计算价格
   this.countAllNumAndPrice(shopCartList);
   app.saveShopCartStorage(shopCartList);

 },
 //点击加号
 numAdd: function (e) {
   console.log("点击加号");
   var shopCartList = this.data.shopCartList;
   //商品在购物车中的顺序
   var index = parseInt(e.currentTarget.dataset.index);
   var num = shopCartList[index]['qty'];
   //区分带规格的商品和不带规格的商品
   var inventory = shopCartList[index]['types'] == 0 ? shopCartList[index]['product']['inventory'] : shopCartList[index]['spec']['inventory'];
   //只有在数量大于0的情况下点击减号生效
   if (num < inventory || inventory < 0 ) {
     num++;
   }else{
     wx.showModal({
      //  title: '芸来商城提示',
       content: '购买数量不能大于该商品的库存',
       showCancel:false,  
     });
   }
   shopCartList[index]['qty'] = num;
   //重新计算价格
   this.countAllNumAndPrice(shopCartList);
   app.saveShopCartStorage(shopCartList);

 },
//编辑状态删除商品
  editDel:function(e){
    var shopCart=this.data.shopCart;
    for (var i = 0; i < shopCart.length;i++){
   //如果购物车中的某个商品为选中状态,删除其对应的商品
      if (shopCart[i].selected==true){
        shopCart[i]={};
        this.setData({
          shopCart: shopCart
        });   
      }
      //重置购物车中商品的状态
       shopCart[i].selected==false;
       this.setData({
         selectedAllStatus: false,
         shopCart: shopCart
       });
}
  },
  //输入框更新商品数量
  numInput:function(e){
    console.log("更新input");
    var shopCartList = this.data.shopCartList;
    //商品在购物车中的顺序
    var index = parseInt(e.currentTarget.dataset.index);
    var num = e.detail.value;
    console.log(num);
    //区分带规格的商品和不带规格的商品
    var inventory = shopCartList[index]['types'] == 0 ? shopCartList[index]['product']['inventory'] : shopCartList[index]['spec']['inventory'];
    //只有在数量大于0的情况下点击减号生效
    if (num > inventory && inventory>=0) {
      wx.showModal({
        // title: '芸来商城提示',
        content: '购买数量不能大于该商品的库存',
        showCancel: false,
      });
      num = shopCartList[index]['qty'];
    }
    //排除误操作
    // if (num == 0) {
    //   num = 1;
    // }
    shopCartList[index]['qty'] = num;
    //重新计算价格
    this.countAllNumAndPrice(shopCartList);
    app.saveShopCartStorage(shopCartList);
  },
  delCartItem:function(e){
    var that=this;
    //商品在购物车中的顺序
    var index = parseInt(e.currentTarget.dataset.index);
    var shopCartList = that.data.shopCartList;
    wx.showModal({
      // title: '芸来商城提示',
      content: '确定要删除吗',
      cancelText: '取消',
      confirmText: '确定',
      confirmColor: '#ff4e44',
      success: function (res) {
        if (res.confirm) {
          shopCartList.splice(index,1);
          //重新计算价格
          that.countAllNumAndPrice(shopCartList);
          app.saveShopCartStorage(shopCartList);
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
        }
      }
    }); 
  },
  //提交订单
  subCart:function(e){
    //如果没选商品就不准提交
    if (app.filterShopCart(this.data.shopCartList).length == 0){
      // app.alert('请选择商品');
      app.openAlert();
      return false;
    }
    // console.log(app.filterShopCart(this.data.shopCartList));
    // return false;
    wx.navigateTo({
      url: '../shop_cart_pay/shop_cart_pay',
    });
  }
})