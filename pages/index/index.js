//index.js

//获取应用实例
const app = getApp()
//获取节点操作
const query = wx.createSelectorQuery()
//引入外部js数据
var bannerData = require('../../data/home-banner.js');
var foodData = require('../../data/food.js');

Page({
  data: {
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标   1表示显示    0表示不显示
      title: '到店取餐', //导航栏 中间的标题
      titleLf:true
    },

    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20 ,
    menuHeight:300,
    indicatorDots:true,
    //判断选中项
    catalogSelect:"100",
    trueToScroll:true,
    textNum:0,
    cartData: [],
    allCount:0,
    showCart:false,
    showVip:false
  },
  //事件处理函数
  bindViewTap: function() {
    
  },
  onShow:function(){
    let that = this
    //从子页面退回时触发
    wx.getStorage({
      key: 'foodData',
      success(res){
        // console.log(res.data)
        that.setData({food_data:res.data})
      }
    })
    wx.getStorage({
      key: 'cartData',
      success(res){
        // console.log(res.data)
        that.setData({cartData:res.data})
      }
    })
    wx.getStorage({
      key: 'allCount',
      success(res){
        // console.log(res.data)
        that.setData({allCount:res.data})
      }
    })
  },
  onLoad: function () {
    // console.log(this.data.height);
    // console.log(foodData);
    // 使用缓存
    wx.clearStorage()
    wx.setStorage({
      data: foodData.foodData[0].data.food_spu_tags,
      key: 'foodData',
    })
    this.setData({
      banner_key:bannerData.bannerList,
      food_data:foodData.foodData[0].data.food_spu_tags
    });
    // wx.getStorage({
    //   key: 'foodData',
    //   success(res){
    //     console.log(res.data)
    //   }
    // })
    // 获取窗口高度
    let resHeight = wx.getSystemInfoSync().windowHeight;
    // console.log(wx.getSystemInfoSync().statusBarHeight);
    //statusBarHeight 状态栏高度 要删去这个高度！
    this.setData({windowHeight:resHeight})
  },
  onReady:function(){
    //在页面渲染完成OnReady回调
    setTimeout( ()=>{
      // console.log(query.select('#menu'));
      // 不加.in(this)获取不到 ！！！！
      query.in(this).select('#menu').boundingClientRect(rect=>{
        // console.log(rect.top);
        // console.log(rect);
        // 获取menu元素的top值用于赋值height
        this.setData({menuTop:rect.top});
        // let menuH = this.data.windowHeight - rect.top
        // console.log(menuH)
        this.setData({menuHeight:this.data.windowHeight - rect.top})
      }).exec();
      query.in(this).selectAll('.food-itemSinner').boundingClientRect(rect=>{
        // 获取13个大项渲染后的属性 top与bottom的组合就是其高度
        // console.log(rect);
        this.setData({foodMenuData:rect})
      }).exec();
      //获取第一个元素swiper的距顶部高度
      query.in(this).select('.page-section').boundingClientRect(rect=>{
        // console.log(rect);
        this.setData({swiperTop:rect.top})
      }).exec();
      // 
      query.in(this).select('.container').boundingClientRect(rect=>{
        // console.log(rect);
        this.setData({windowBottom:rect.bottom})
      }).exec();
      // 对data数据进行处理 循环给每一项加入thisPtIdx = index thisIdx = idx
      let data = this.data.food_data
      data.forEach((item,index)=>{
        item.spus.forEach((child,idx)=>{
          child.thisPtIdx = index
          child.thisIdx = idx
        })
      })
      this.setData({food_data:data})
      wx.setStorage({
        data: data,
        key: 'foodData',
      })
    },1000)
  },
  // 点击事件
  itemClick:function(event){
    // console.log(event);
    // console.log(event.currentTarget.dataset.select);
    // 点击时候切换data中的catalogSelect值为渲染时候的data-select值 使其拥有active样式
    // 并且会改变toView的值 使其滚动到对应id值的元素位置
    let mwNum = 'mw'+event.currentTarget.dataset.index;
    // console.log(mwNum);
    this.setData({
      catalogSelect:event.currentTarget.dataset.select,
      toView:event.currentTarget.id,
      toMenu:mwNum
    })
  },
  // 滚动事件
  menuScroll:function(event){
    // 减少触发次数
    if(!this.data.trueToScroll) return;
    // console.log(event);
    this.setData({trueToScroll :false})
    let that = this;
    let foodData = that.data.foodMenuData;
    // 滚动距离要加上原本的offsetTop才能与元素的滚动距离相对应
    let scroollNum = event.currentTarget.offsetTop + event.detail.scrollTop;
    //将页面滚动到目标位置，支持选择器和滚动距离两种方式定位
    //当滚动一定的高度时候整个页面滚动一定距离 不超过就返回
    if(event.detail.scrollTop > 200){
      // 更改menuTop的值 让menu的高度为全屏 方便滚动
      this.setData({menuHeight:this.data.windowHeight - this.data.swiperTop})
      setTimeout(()=>{
        wx.pageScrollTo({scrollTop:event.currentTarget.offsetTop,duration:100})
      },100)
      // console.log(event.currentTarget.offsetTop);
    }else{
      // 改回menuTop的值 让menu的高度为原来的值 
      setTimeout(()=>{
        wx.pageScrollTo({scrollTop:0,duration:100})
        // console.log(this.data)
        this.setData({menuHeight:this.data.windowHeight - this.data.menuTop})
      },100)
      // console.log(2);
    }
    setTimeout(()=>{
      // 通过try和catch配合 在条件成立时候报错 以便跳出循环 对比当前滚动值是否在大项中
      try{
        foodData.forEach((item,index) =>{
          // 通过循环 对比scrollTop的值判断
          // console.log(item);
          // console.log(item.top <= scroollNum);
          // console.log(item.bottom >= scroollNum);
          // console.log(scroollNum);
          if(item.top<=scroollNum && item.bottom >= scroollNum){
            // console.log(111);
            this.setData({
              catalogSelect:this.data.food_data[item.dataset.index].tag,
              toView:'sw'+item.dataset.index,
            })
            throw Error();
          }
        })
      }catch(e){
      }
      that.setData({
        trueToScroll :true,
        scrollTopNum:scroollNum
      })
    },300)
  },
  // 购物车的点击添加事件
  addItem:function(event){
    let e = event;
    this.dataUpdate(e,true);
  },
  // 购物车的点击删除事件
  removeItem:function(event){
    let e = event;
    this.dataUpdate(e,false);
  },
  //数据中的更新
  dataUpdate:function(e,addTF){
    // console.log(e.currentTarget);
    let data = this.data.food_data;
    let ptIdx = e.currentTarget.dataset.parentindex;
    let thisIdx = e.currentTarget.dataset.index;
    if(addTF){
      data[ptIdx].spus[thisIdx].status = data[ptIdx].spus[thisIdx].status+1;
    }else{
      data[ptIdx].spus[thisIdx].status = data[ptIdx].spus[thisIdx].status-1;
    }
    this.setData({food_data:data})
    //将所选项放到一个数组中 保存了完整的项 以及index值 用于之后使用
    let thisItem = data[ptIdx].spus[thisIdx];
    thisItem.thisIdx = thisIdx;
    thisItem.thisPtIdx = ptIdx;
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
    // console.log(this.data.cartData);
  },
  //进行缓存更新
  updateStorage:function(){
    let data = this.data.food_data
    let cartData = this.data.cartData
    let count = this.data.allCount
    wx.setStorage({
      data: data,
      key: 'foodData',
    })
    wx.setStorage({
      data: cartData,
      key: 'cartData',
    })
    wx.setStorage({
      data: count,
      key: 'allCount',
    })
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
   },
  // 地图按钮点击事件
  showAddress:function(event){
    console.log(1);
  },
  //会员中心点击事件
  goToVip:function(){
    console.log(1)
    this.setData({showVip:true})
  },
  //搜索按钮被点击 跳转页面
  goToSearch:function(event){
    // console.log(event);
    this.updateStorage()
    let foodData = this.data.food_data;
    wx.navigateTo({
      url:"search/search",
    })
  },
  upDataData:function(){
    
  },
  // 跳转到确认订单页
  goToConfirm:function(event){
    this.updateStorage()
    // console.log('go')
    wx.navigateTo({
      url: 'confirm/confirm',
    })
  },
})
