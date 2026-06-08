// 单词鸭 (TomatoWord) MITM 破解脚本 - Loon版
// 支持 Loon
// API域名: zhcn.api.wordln.com

const url = $request.url;
const method = $request.method;

if (method === 'OPTIONS') {
  $done({});
  return;
}

// 处理响应
if ($response && $response.body) {
  let body = JSON.parse($response.body);
  
  // 用户信息接口 - 修改VIP状态和金币
  if (url.indexOf('/tomato-word/user/getInfor') >= 0) {
    if (body.data) {
      body.data.userType = 1;
      body.data.ifVIPEnable = true;
      body.data.vipHandler = true;
      body.data.xgVipTag = 1;
      body.data.uservip = "1";
      body.data.isVip = true;
      body.data.memberType = "vip";
      body.data.memberTypeId = 1;
      body.data.has_paid = true;
      body.data.is_lifetime = true;
      
      if (body.data.goldCoin !== undefined && body.data.goldCoin < 999999) body.data.goldCoin = 999999;
      if (body.data.coin !== undefined && body.data.coin < 999999) body.data.coin = 999999;
      
      body.data.vipExpireDate = "2099-12-31 23:59:59";
      body.data.vipExpireTime = 4102444799000;
      body.data.expireTime = 4102444799000;
    }
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  // 支付配置 - 价格改为0
  if (url.indexOf('/tomato-word/getPayConfig') >= 0) {
    if (body.data) {
      body.data.vipPrice = 0;
      body.data.price = 0;
      body.data.priceStr = "0";
      body.data.originalPrice = 0;
    }
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  // 签到接口
  if (url.indexOf('/tomato-word/user/sign') >= 0) {
    if (body.data) {
      body.data.signDays = 365;
      body.data.continuousDays = 365;
    }
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  // 通用 - 修改所有响应中的VIP字段
  function fixAll(obj) {
    if (!obj || typeof obj !== 'object') return;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      
      // VIP布尔字段
      if (key === 'isVip' || key === 'is_vip' || key === 'vip' || 
          key === 'ifVIPEnable' || key === 'vipHandler' || 
          key === 'has_paid' || key === 'is_lifetime' || key === 'paid') {
        obj[key] = true;
      }
      
      // VIP数字字段
      if (key === 'userType' || key === 'memberTypeId' || key === 'xgVipTag') {
        if (typeof obj[key] === 'number' && obj[key] < 1) {
          obj[key] = 1;
        }
      }
      
      // 金币字段
      if (key === 'goldCoin' || key === 'coin' || key === 'gold' || 
          key === 'diamond' || key === 'gems' || key === 'score' ||
          key === 'points' || key === 'balance') {
        if (typeof obj[key] === 'number' && obj[key] < 99999) {
          obj[key] = 999999;
        }
      }
      
      if (typeof obj[key] === 'object') fixAll(obj[key]);
    }
  }
  
  fixAll(body);
  $done({ body: JSON.stringify(body) });
  return;
}

$done({});
