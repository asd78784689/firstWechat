const app = getApp()
Component({
  properties: {
    navbarData: {   //navbarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},
      observer: function (newVal, oldVal) {}
    }
  },
  data: {
    height: '',
    //默认值  默认显示左上角
    navbarData: {
      showCapsule: 1,
    },
    back:true,
    _backhome:false,
    backTo:false
  },
  attached: function () {
    // 获取是否是通过分享进入的小程序
    this.setData({
      share: app.globalData.share
    })
    // 定义导航栏的高度   方便对齐
    this.setData({
      navHeight: app.globalData.navHeight,
      navTop:app.globalData.navTop
    })
  },
  methods: {
  // 返回上一页面
    _navback() {
      if(this.data.navbarData.backTo){
        // 如果需要返回数据就得用这个 需要传递一个数据值以及保存于父页面data中的属性名
        var pages = getCurrentPages();
        // 获取路由信息 返回上一级页面
        var prevPage = pages[pages.length - 2]
        //this.data.navbarData 获取父组件传递的参数 
        var backData = this.data.navbarData.backData
        var backName = this.data.navbarData.name
        // console.log(this.data.navbarData)
        // 将数据用setData保存到上一张页面中 然后返回
        prevPage.setData({backName:backData})
        // console.log(prevPage)
        wx.navigateBack()
      }else{
        wx.navigateBack()
      }
      //this.data.navbarData 获取父组件传递的参数
      // wx.navigateBack()
    },
  //返回到首页
    _backhome() {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  }

}) 