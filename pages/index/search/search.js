// pages/index/search.js

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
      title: '点餐', //导航栏 中间的标题
      titleLf:true,
      backTo:false
    },

    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20 ,
    menuHeight:300,
    trueSearch:true,
    showCart:false,
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
    let that = this;
    
    // 从缓存中获取
    wx.getStorage({
        key: 'foodData',
        success(res){
          // console.log(res.data)
          that.setData({backData:res.data})
        }
    })
    //获取购物车信息
    wx.getStorage({
      key: 'cartData',
      success(res){
        that.setData({cartData:res.data})
      },
      fail(){
        console.log('空');
        that.setData({cartData:[]})
      }
    })
    //获取购物车总价
    wx.getStorage({
      key: 'allCount',
      success(res){
        that.setData({allCount:res.data})
      },
      fail(){
        // console.log('空');
        that.setData({allCount:0})
      }
    })
  },
  
  // 返回上一级
  goBack:function(event){
    //返回时候要将购物车数据一同返回出去 
    console.log(1);
    // var pages = getCurrentPages();
    // // 获取路由信息 返回上一级页面
    // var prevPage = pages[pages.length - 2]
    // prevPage.setData({food_data:this.data.backData})
    wx.navigateBack();
  },
  // 输入内容时触发
  iptChange:function(event){
    // console.log(event.detail.value);
    // 减少次数
    if(!this.data.trueSearch) return
    this.setData({trueSearch:false})
    let thisVal = event.detail.value
    let searchData = []
    // 进行对data数据中的筛选
    let data = this.data.backData
    if(thisVal){
      //不为空时执行
      data.forEach((item,index)=>{
        item.spus.forEach((child,idx)=>{
          if(child.name.indexOf(thisVal) >-1){
            searchData.push(child)
          }
        })
      })
    } 
    // console.log(searchData)
    this.setData({searchData:searchData})
    this.setData({trueSearch:true})
  },
  // 搜索栏的点击
  upDataData:function(event){
    // console.log(event);
    // 更新搜索栏数据
    //event.target.dataset
    // console.log(this.data.searchData)
    let data = this.data.searchData
    let ptIdx = event.target.dataset.parentindex
    let tsIdx = event.target.dataset.index
    let fooddata = this.data.backData
    try{
      data.forEach((item)=>{
        if(ptIdx == item.thisPtIdx && tsIdx == item.thisIdx){
          item.status = fooddata[ptIdx].spus[tsIdx].status
          throw Error();
        }
      })
    }catch(e){

    }
    this.setData({searchData:data})
  },
  // 购物车的点击
  addItem:function(event){
    // console.log(event);
    let e = event;
    this.dataUpdate(e,true);
    // 通过点击项上的data-index 获取到searchData对应项
    //修改其中的status 
    //再通过其中的thisPatIdx和thisIdx修改storage中的数据 和 购物车中
  },
  removeItem:function(event){
    let e = event;
    this.dataUpdate(e,false);
  },
  // 更新数据
  dataUpdate:function(e,addTF){
    //购物车不需要获取searchData的数据
    let data = this.data.backData
    let pIdx = e.currentTarget.dataset.parentindex;
    let eIdx = e.currentTarget.dataset.index
    let thisItem = data[pIdx].spus[eIdx]
    if(addTF){
      thisItem.status = thisItem.status+1
    }else{
      thisItem.status = thisItem.status-1
    }
    // console.log(thisItem)
    // 更新缓存中数据
    // console.log(foodData[thisItem.thisPatIdx].spus[thisItem.thisIdx])
    wx.setStorage({
      data: data,
      key: 'foodData',
    })
    this.cartUpdate(thisItem,addTF)
  },
  // 更新购物车
  cartUpdate:function(thisItem,addTF){
    //更新购物车信息
    // console.log(thisItem)
    let cart = this.data.cartData
    if(!cart.length){
      cart.push(thisItem)
    }else{
      let TF = cart.findIndex((item)=>{
        return item.id === thisItem.id
      })
      // console.log(TF)
      if(TF>-1 && !addTF){
        cart[TF].status = thisItem.status
        //删除时判断status是否为0
        if(cart[TF].status === 0){
          // console.log('this')
          cart.splice(TF,1)
        }
      }else if(TF > -1){
        cart[TF].status = thisItem.status
      }else{
        cart.push(thisItem)
      }
    }
    //进行数组的总价计算
    let count = 0
    cart.forEach((item)=>{
      count += item.status*item.min_price
    })
    // console.log(cart)
    // console.log(count)
    this.setData({cartData:cart,allCount:count})
    wx.setStorage({
      data: cart,
      key: 'cartData',
    })
    wx.setStorage({
      data: count,
      key: 'allCount',
    })
  },
  // 获取用于给scroll-view高度的值
  getMenuHeight:function(){
    setTimeout( ()=>{
      // console.log(this.data);
      // console.log(query.select('#menu'));
      // 不加.in(this)获取不到 ！！！！
      let that = this
      // 保存在缓存中 防止重新载入时出错
      wx.getStorage({
        key: 'searchHeight',
        success(res){
          // console.log(res)
          that.setData({menuHeight:res.data})
        },
        fail(){
          query.in(that).select('#sContainer').boundingClientRect(rect=>{
            // console.log(rect.top);
            // console.log(rect);
            // 获取menu元素的top值用于赋值height
            that.setData({menuTop:rect.top});
            // let menuH = that.data.windowHeight - rect.top
            // console.log(menuH)
            that.setData({menuHeight:that.data.windowHeight - rect.top})
            // console.log(that.data)
            wx.setStorage({
              data: that.data.windowHeight - rect.top,
              key: 'searchHeight',
            })
          }).exec();
        }
      })
      
    },100)
  },
  // 显示购物车详情
  showList:function(event){
    // console.log(event);
    let show = !this.data.showCart
    this.setData({showCart:show})
    wx.setStorage({
      data: show,
      key: 'showCart',
    })
  },
  //清空购物车
  clearCart:function(event){
    // console.log('清空')
    //要对foodData、cartData、allCount均做处理
    let data = this.data.food_data
    let cartData = this.data.cartData;
    // console.log(cartData)
    cartData.forEach((item)=>{
      let thisIdx = item.thisIdx
      let thisPtIdx = item.thisPtIdx
      data[thisPtIdx].spus[thisIdx].status = 0
    })
    this.setData({food_data:data})
    this.setData({cartData:[]})
    this.setData({allCount:0})
    // 更改缓存
    wx.setStorage({
      data: data,
      key: 'foodData',
    })
    wx.setStorage({
      data: [],
      key: 'cartData',
    })
    wx.setStorage({
      data: 0,
      key: 'allCount',
    })
   },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      // console.log(1);
      //在页面渲染完成OnReady回调
      this.getMenuHeight()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log(2);
      // this.getMenuHeight()
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