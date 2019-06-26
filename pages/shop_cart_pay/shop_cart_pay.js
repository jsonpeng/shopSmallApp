// pages/shop_cart_pay/shop_cart_pay.js
var app = getApp();
var functions = require('../../zcjy/function.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponUse:false,
    shopCartList:[],
    allNum: 0,
    allCount: 0,
    needMoney:0,
    addressList:[],
    coupon_id:0,
    coupon_text:'',
    coupons:app.conf.coupons,
    address:'',
    //最多使用积分
    max_credits:0,
    //优惠金额
    couponPrice:0,
    //使用余额
    use_user_money:0,
    //使用积分
    use_credits:0,
    //积分折算金额
    creditMoney:0,
    //会员折算金额
    member_money:0,
    //选择优惠券状态
    couponStatus:false,
    inputs:{
      items:[],
      customer_name:'',
      customer_phone:'',
      customer_address:'',
      freight:'',
      address_id:'',
      coupon_id:'',
      credits:'',
      user_money_pay:'',
      prom_type:'',
      prom_id:'',
      remark:'',
    }
  },
  //使用优惠券
  useCoupon:function(e){
    console.log('使用优惠券');
    var shopCartList = app.getShopCartStorage();
    //选择前先置空
    app.countAllNumAndPrice(this, shopCartList);
    var inputs = {
      items: app.filterShopCart(this.data.shopCartList),
    };
    //选择单个优惠券后
    app.selectOneCoupon(e.currentTarget.dataset.id, this, inputs);
    //前端显示设置
    this.setData({
      coupon_text: e.currentTarget.dataset.text,
    });
  },  
  //选择优惠券
  chooseCoupon:function(e){
    console.log('选择优惠券');
    if (e.currentTarget.dataset.type=='getCoupon'){
      var inputs = {
        items: app.filterShopCart(this.data.shopCartList),
      };
      app.getCanUseCoupons(this, inputs);
    }else{
      this.setData({
        couponStatus:false
      });
    }
  },
  //支付
  payNow:function(){
    var inputs = {
      items: app.filterShopCart(this.data.shopCartList),
      customer_name: this.data.address.name,
      customer_phone: this.data.address.phone,
      customer_address: this.data.address.detail,
      freight: this.data.cart.freight,
      address_id: this.data.address.district,
      coupon_id: this.data.coupon_id,
      credits: this.data.use_credits,
      user_money_pay: this.data.use_user_money,
      prom_type: this.data.cart.prom_type,
      prom_id: this.data.cart.prom_id,
      remark: this.data.inputs.remark
    };
    if (this.data.allCount == 0 || this.data.inputs.items==[]){
      wx.showModal({
        content: '您还未选择商品',
        showCancel: false,
        confirmText: '去挑选',
        confirmColor: that.conf.themeColor,
        success: function (res){
          if (res.confirm) {
            wx.switchTab({
              url: '../shop_cart/shop_cart',
            });
          }
        }
      });

    }else{
      app.payToOrder(inputs);
    }
  },
  remarkInputSave:function(e){
    var inputs = {
      items: this.data.shopCartList,
      customer_name: this.data.address.name,
      customer_phone: this.data.address.phone,
      customer_address: this.data.address.detail,
      freight: 0,
      address_id: this.data.address.district,
      coupon_id: 0,
      credits: 0,
      user_money_pay: 0,
      prom_type: 0,
      prom_id: 0,
      remark: e.detail.value
      }
    this.setData({
      inputs: inputs
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //基本功能开关
    app.AutoVarifyCache('switch', function (e) {
      if (!e) {
        app.getFuncSwithList(that);
      } else {
        that.setData({
          switch: e
        });
      }
    });
    //所有功能开关关键值
    app.AutoVarifyCache('allfunc', function (e) {
      if (!e) {
        app.getAllFunc(function (res) {
          app.getArrValueByKey('credits_alias', res, function (val) {
            that.setData({
              credits_alias:val
            })
          });
        });
      } else {
        //积分
        app.getArrValueByKey('credits_alias', e, function (val) {
          that.setData({
            credits_alias: val
          })
        });
        //最多可使用
        app.getArrValueByKey('credits_max', e, function (val) {
          that.setData({
            credits_max: val
          })
        });
        //积分比例
        app.getArrValueByKey('credits_rate', e, function (val) {
          that.setData({
            credits_rate: val
          })
        });
      }
    });
    //颜色设置
    app.getColorSet(that);
    var shopCartList = app.getShopCartStorage();
    //统计
    app.countAllNumAndPrice(that, shopCartList);
    var inputs = {
      items: app.filterShopCart(that.data.shopCartList),
    };

    //存在地址选择就返回对应id的地址
    if (options.addresss_id) {
      var address = app.getSingeAddress(options.addresss_id);
      console.log(address);
      that.setData({
        address: address
      });
      inputs['address_id'] = address.id;

      //获取结算参数
      app.cartPreference(that, inputs, function (e,m) {
        that.setData({
          max_credits: functions.maxCredits(m.user.credits, e.total, that.data.credits_max, that.data.credits_rate)
        });
        that.setNeedPay();
      });

    }
    else {
      //不然就取默认的地址列表
      app.getAddressList(that, true, function (res) {
        inputs['address_id'] = res.id;
        //获取结算参数
        app.cartPreference(that, inputs, function (e,m) {
          that.setData({
            max_credits: functions.maxCredits(m.user.credits, e.total, that.data.credits_max, that.data.credits_rate)
          });
         
        });
      });

    }
  },
  /**
   * 修改地址
   */
  edit_to:function(){
      app.conf.checknow=true;
      wx.navigateTo({
        url: '../address/address',
      });
  },
  //积分添加
  creadits_add:function(e){
    var max_credits = this.data.max_credits;
    var use_credits = this.data.use_credits;
    ++use_credits;
    if (use_credits <= max_credits && use_credits <= this.needMaxCreditsByJiFen()){
      this.setData({
        use_credits: use_credits,
        creditMoney: (use_credits / this.data.credits_rate).toFixed(2)
      });
      console.log(this.needMaxCreditsByJiFen());
      this.setNeedPay();
    }
  },
  //积分减少
  creadits_del:function(e){
    var max_credits = this.data.max_credits;
    var use_credits = this.data.use_credits;
    --use_credits;
    if (use_credits < max_credits && use_credits >= 0) {
      this.setData({
        use_credits: use_credits,
        creditMoney: (use_credits / this.data.credits_rate).toFixed(2)
      })
      this.setNeedPay();
    }
  },
  //积分输入
  creadits_input:function(e){
    var max_credits = parseInt(this.data.max_credits);
    var use_credits = parseInt(e.detail.value);
    if (use_credits > max_credits){
      use_credits = max_credits
    } 
    if (use_credits > this.needMaxCreditsByJiFen()) {
      use_credits = this.needMaxCreditsByJiFen()
    } 
    if (use_credits <= max_credits && use_credits > 0 && use_credits <= this.needMaxCreditsByJiFen()) {
      this.setData({
        use_credits: use_credits,
        creditMoney: (use_credits / this.data.credits_rate).toFixed(2)
      })
      this.setNeedPay();
    }
  },
  //账户添加
  user_add:function(){
    console.log('add');
    var max_money = this.data.myself.user.user_money;
    var use_user_money = this.data.use_user_money;
    ++use_user_money;
    if (use_user_money < max_money && use_user_money < this.needMaxMoneyByYuE()) {
      this.setData({
        use_user_money: use_user_money,
      })
      this.setNeedPay();
    }
  },
  //余额输入
  user_input:function(e){
    var max_money = this.data.myself.user.user_money;
    if (app.empty(e.detail.value)){
      e.detail.value=0;
    }
    if (e.detail.value.length > 1 && parseInt(e.detail.value.toString().slice(0,1))== 0){
      e.detail.value = parseInt(e.detail.value.toString().slice(1, 2));
    }

    var use_user_money = e.detail.value;

    if (use_user_money < max_money && use_user_money >= 0 && use_user_money < this.needMaxMoneyByYuE()) {
      this.setData({
        use_user_money: use_user_money
      })
      this.setNeedPay();
    }
  },
  //账户减少:
  user_del:function(){
    console.log('del');
    var max_money = this.data.myself.user.user_money;
    var use_user_money = this.data.use_user_money;
    --use_user_money;
    if (use_user_money < max_money && use_user_money >= 0) {
      this.setData({
        use_user_money: use_user_money
      })
      this.setNeedPay();
    }
  },
  //余额需要的最大
  needMaxMoneyByYuE:function(){
    return this.data.cart.total - this.data.cart.order_promp_money - this.data.couponPrice - this.data.creditMoney - this.data.member_money + this.data.cart.freight;
  },
  //积分需要的最大:
  needMaxCreditsByJiFen:function(){
    // console.log((this.data.cart.total - this.data.cart.order_promp_money - this.data.couponPrice - this.data.use_user_money - this.data.member_money + this.data.cart.freight) * this.data.credits_rate);
    return (this.data.cart.total - this.data.cart.order_promp_money - this.data.couponPrice - this.data.use_user_money - this.data.member_money + this.data.cart.freight) * this.data.credits_rate;
  },
  //使用全部账户余额
   userAllMoney:function() {
     var calPrice = this.data.cart.total - this.data.cart.order_promp_money - this.data.couponPrice - this.data.creditMoney - this.data.member_money + this.data.cart.freight;
     if (calPrice > this.data.myself.user.user_money) {
       calPrice = this.data.myself.user.user_money;
    }
    this.setData({
      use_user_money: calPrice
    });
    this.setNeedPay();
    },
    //设置需要支付的金额
    setNeedPay:function(){
        var money = (this.data.cart.total - this.data.cart.order_promp_money - this.data.couponPrice - this.data.creditMoney - this.data.member_money - this.data.use_user_money + this.data.cart.freight).toFixed(2);
      money = money < 0 ? 0 : money;
      this.setData({
        needMoney: money
      })
    },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (){
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.getColorSet(this);
    this.onLoad();
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
  
  },
  

  //日期选择
  dateSelect:function(e){
  this.setData({
    dateTime: e.detail.value
    });
  },

//具体时间
hourSelect:function(e){
  this.setData({
    hourTime: e.detail.value
  });
},

//付款方式选择
payFunc:function(e){
  this.setData({
    index: e.detail.value
  });

},

//优惠券
  goToYouHui:function(e){
    wx.navigateTo({
      url: '../myself_youhuiquan/myself_youhuiquan',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

//是否开发票
  whetherSelectFaPiao:function(e){
    console.log("是否开发票:" + e.detail.value);
    this.setData({
      whetherFaPiao: e.detail.value,
    });
},

//确认支付
varifyPay:function(e){

wx.navigateTo({
  url: '../shop_pay_list/shop_pay_list',
})

},

//返回订单
  backToShop:function(e){
    wx.navigateBack({
      delta: 1
    })

  }




})