// 捏词 (nieci) Premium Unlock - Loon Script
// 拦截API: www.kwhat.fun
// 功能: 解锁会员 + 罐头积分

var url = $request.url;
var method = $request.method;
var isResponse = typeof $response !== 'undefined';

if (isResponse) {
  var body = $response.body;
  
  try {
    // POST /nieci/user/getUserInfo - 会员信息
    if (url.indexOf('/nieci/user/getUserInfo') !== -1 && method === 'POST') {
      var obj = JSON.parse(body);
      if (obj.code === 200 && obj.data) {
        obj.data.expireTime = "2099-12-31T23:59:59.000+00:00";
        obj.data.userType = 1;
        obj.data.listenTimes = 9999;
        obj.data.contextLength = 9999;
        console.log('nieci: 会员解锁成功');
      }
      body = JSON.stringify(obj);
    }
    
    // GET /nieci/score/balance - 罐头积分
    else if (url.indexOf('/nieci/score/balance') !== -1 && method === 'GET') {
      var obj = JSON.parse(body);
      if (obj.code === 200) {
        obj.data = 999999;
        console.log('nieci: 积分修改成功');
      }
      body = JSON.stringify(obj);
    }
    
    // POST /nieci/user/getBindIdol - 绑定数量
    else if (url.indexOf('/nieci/user/getBindIdol') !== -1 && method === 'POST') {
      var obj = JSON.parse(body);
      if (obj.code === 200 && obj.data) {
        obj.data.limitNum = 9999;
        console.log('nieci: 绑定数量解锁');
      }
      body = JSON.stringify(obj);
    }
    
    // POST /nieci/order/getProductDetail-apple - 商品价格改为0
    else if (url.indexOf('/nieci/order/getProductDetail-apple') !== -1 && method === 'POST') {
      var obj = JSON.parse(body);
      if (obj.code === 200 && obj.data) {
        if (obj.data.subscriptionList) {
          for (var i = 0; i < obj.data.subscriptionList.length; i++) {
            obj.data.subscriptionList[i].payNum = 0;
            obj.data.subscriptionList[i].originalPrice = 0;
          }
        }
        if (obj.data.consumeList) {
          for (var i = 0; i < obj.data.consumeList.length; i++) {
            obj.data.consumeList[i].payNum = 0;
          }
        }
        console.log('nieci: 商品价格改为0');
      }
      body = JSON.stringify(obj);
    }
    
    // POST /nieci/user/getNotice - 标记所有公告已读
    else if (url.indexOf('/nieci/user/getNotice') !== -1 && method === 'POST') {
      var obj = JSON.parse(body);
      if (obj.code === 200 && obj.data) {
        if (obj.data.systemNoticeDTOs) {
          for (var i = 0; i < obj.data.systemNoticeDTOs.length; i++) {
            obj.data.systemNoticeDTOs[i].ifChecked = true;
          }
        }
        obj.data.uncheckedNum = 0;
      }
      body = JSON.stringify(obj);
    }
    
  } catch (e) {
    console.log('nieci: 解析错误 - ' + e.message);
  }
  
  $done({body: body});
} else {
  $done({});
}
