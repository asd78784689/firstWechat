// pages/index/confirm/confirm.js
//获取应用实例
const app = getApp()
//获取节点操作
const query = wx.createSelectorQuery()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '确认订单', //导航栏 中间的标题
      titleLf:true
    },

    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20 ,
    menuHeight:300,
    indicatorDots:true,
    iptTypeData:[  //单选框的被选项存储
      {
        type:"way",
        key:'',
      },{
        type:"time",
        key:'',
      },{
        type:"pay",
        key:'',
      },{
        type:"need",
        key:0,
      }
    ],
    wayType:false,
    timeType:false,
    payType:false,
    disable:true,
    showPopup:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // 获取窗口高度
    let resHeight = wx.getSystemInfoSync().windowHeight;
    // console.log(wx.getSystemInfoSync().statusBarHeight);
    //statusBarHeight 状态栏高度 要删去这个高度！
    this.setData({windowHeight:resHeight})
    //获取缓存数据
    let that = this
    wx.getStorage({
      key: 'foodData',
      success(res){
        that.setData({foodData:res.data})
      }
    })
    wx.getStorage({
      key: 'cartData',
      success(res){
        that.setData({cartData:res.data})
      }
    })
    wx.getStorage({
      key: 'allCount',
      success(res){
        that.setData({allCount:res.data})
      }
    })
  },
  // 更新数据
  upDataData:function(){
    
  },
  // 更新数据
  addItem:function(event){
    let e = event;
    this.dataUpdate(e,true);
  },
  // 更新数据
  removeItem:function(event){
    let e = event;
    this.dataUpdate(e,false);
  },
  //数据中的更新
  dataUpdate:function(e,addTF){
    // console.log(e);
    let data = this.data.foodData;
    let ptIdx = e.currentTarget.dataset.parentindex;
    let thisIdx = e.currentTarget.dataset.index;
    if(addTF){
      data[ptIdx].spus[thisIdx].status = data[ptIdx].spus[thisIdx].status+1;
    }else{
      data[ptIdx].spus[thisIdx].status = data[ptIdx].spus[thisIdx].status-1;
    }
    this.setData({foodData:data})
    wx.setStorage({
      data: data,
      key: 'foodData',
    })
    //将所选项放到一个数组中 保存了完整的项 以及index值 用于之后使用
    let thisItem = data[ptIdx].spus[thisIdx];
    // console.log(thisItem);
    this.cartToUpdate(thisItem,addTF);
  },
  // 购物车的数组更新
  cartToUpdate:function(TSitem,add){
    let cartData = this.data.cartData;
    if(!cartData.length){
      cartData.push(TSitem);
    }else{
      let TF = cartData.findIndex((item)=>{
        return item.id === TSitem.id
      })
      if(TF>-1 && !add){
        cartData[TF].status = TSitem.status
        //删除时判断status是否为0
        if(cartData[TF].status === 0){
          cartData.splice(TF,1)
        }
      }else if(TF > -1){
        cartData[TF].status = TSitem.status
      }else{
        cartData.push(TSitem)
      }
    }
    //进行数组的总价计算
    let count = 0
    cartData.forEach((item)=>{
      count += item.status*item.min_price
    })
    this.setData({cartData:cartData,allCount:count})
    wx.setStorage({
      data: cartData,
      key: 'cartData',
    })
    wx.setStorage({
      data: count,
      key: 'allCount',
    })
    // console.log(this.data.cartData);
  },
  // 取餐方式被选中时
  wayChange:function(event){
    // console.log(event)
    //iptTypeData
    let e = event
    this.updateiptTypeData(e)
    this.setData({wayType:true})
    this.disabledBtn()
  },
  // 取餐时间被选中时
  timeChange:function(event){
    // console.log(event)
    let e = event
    this.updateiptTypeData(e)
    this.setData({timeType:true})
    this.disabledBtn()
  },
  // 支付方式被选中时
  payChange:function(event){
    // console.log(event)
    let e = event
    this.updateiptTypeData(e)
    this.setData({payType:true})
    this.disabledBtn()
  },
  // 发票需求被选中时
  needChange:function(event){
    // console.log(event)
    let e = event
    this.updateiptTypeData(e)
  },
  // 更新数据
  updateiptTypeData:function(e){
    let key = e.detail.key
    let index = e.currentTarget.dataset.index
    let data = this.data.iptTypeData
    data[index].key = key
    this.setData({iptTypeData:data})
  },
  // 判断按钮是否可用
  disabledBtn:function(){
    // !wayType && !timeType && !payType 
    let that = this
    if(that.data.wayType && that.data.timeType && that.data.payType){
      that.setData({disable:false})
    }else{
      that.setData({disable:true})
    }
  },
  //goToPay去支付
  goToPay:function(event){
    console.log(event)
    this.setData({showPopup:true})
  },
  //隐藏弹出
  hidePopup:function(){
    this.setData({showPopup:false})
  },
  //修改被点击
  modifyClick:function(event){
    console.log('修改餐厅')
  },
  //确认并支付被点击时
  payClick:function(event){
    console.log('确认支付')
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //在页面渲染完成OnReady回调
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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