// pages/address/add.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:'',
    phone:'',
    detail:'',
    checknow:'',
    default:false,
    provinces:[],
    provinces_many:[],
    province:0,
    city:0,
    district:0,
    provincesIndexType:0,
    cities:[],
    cities_many:[],
    citiesIndexType:0,
    districts:[],
    districts_many:[],
    districtsIndexType:0,
    edit:false,
    hidden:true,
    address_id:''
  },
  back:function(){
    wx.navigateBack(); 
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
    console.log(options);
    if (options.checknow){
        this.setData({
          checknow: true
        });
    }
    if(options.id){
        console.log('编辑页面');
        app.getEditAddress(that,options.id);
    }else{
      app.getBasicProvinceList(that);
    }
  },
  saveForm:function(e){
    if (this.data.name != '' && this.data.phone != '' && this.data.detail != '' && this.data.province != 0 && this.data.city != 0 && this.data.district != 0){
      app.saveAddress(this.data.name, this.data.phone, this.data.detail, this.data.province, this.data.city, this.data.district, this.data.default, this.data.checknow, this.data.edit, this.data.address_id);
    }else{
      wx.showModal({
        // title: '芸来商城提示',
        content: '参数输入不完整',
        showCancel: false,
        confirmColor:'#ff4e44'
      });
    }
  },
  varifyformParameter:function(){

  },
  //设置默认地址
  switchChange:function(e){
    console.log(e.detail.value);
    this.setData({
      default: e.detail.value
    });
  },
  //保存收件人
  saveName:function(e){
    this.setData({
      name: e.detail.value
    });
  },
  //保存电话
  savePhone:function(e){
    this.setData({
      phone:e.detail.value
    });
  },
  //保存详细收货地址
  saveAddress:function(e){
    this.setData({
      detail:e.detail.value
    });
  },
  //三级联动下拉
  bindChange: function (e) {
    var types = e.currentTarget.dataset.types;
    var index = e.detail.value;
    //省份选择
    if (types =='provinces'){
    var provinces_many = this.data.provinces_many;
    console.log('provinces，当前位置为'+ index)
 
    //根据当前选中的位置找当前的id
    console.log(app.getCitiesIdByIndex(provinces_many, index));
    var parent_id = app.getCitiesIdByIndex(provinces_many, index);
    this.setData({
      provincesIndexType: index,
      province: parent_id
    });
    //如果选择第一项就重置
    if (index == 0) {
      this.setData({
      cities:[],
      cities_many:[],
      districts: [],
      districts_many: []
      });
      return false;
    }
    app.getChildrenCitiesListByParentId(this, parent_id);
    } else if (types=='cities'){
      var cities_many = this.data.cities_many;
      console.log('provinces，当前位置为' + index);
  
      console.log(app.getCitiesIdByIndex(cities_many, index));
      var parent_id = app.getCitiesIdByIndex(cities_many, index);
      this.setData({
        citiesIndexType: index,
        city: parent_id
      });
      //如果选择第一项就重置
      if (index == 0) {
        this.setData({
          districts: [],
          districts_many: []
        });
        return false;
      }
      app.getChildrenCitiesListByParentId(this, parent_id,'districts');
    }else{
      var districts_many = this.data.districts_many;
      var districts = app.getCitiesIdByIndex(districts_many, index);
      var detail = this.data.provinces[this.data.provincesIndexType] + this.data.cities[this.data.citiesIndexType] + '市' + this.data.districts[this.data.districtsIndexType];
      this.setData({
        districtsIndexType:index,
        district: districts,
        //detail:detail
      });
    }
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