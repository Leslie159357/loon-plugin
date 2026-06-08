// ==UserScript==
// @name         FIMO VIP Unlock
// @version      1.2.0
// @description  解锁FIMO相机全部VIP功能 - subscribe.valid + forever + film special改为free
// @author       Minis
// @license      MIT
// ==/UserScript==

var url = $request.url;
var body = $response.body;
var obj = null;

// 尝试解析JSON
if (body) {
  try {
    obj = JSON.parse(body);
  } catch (e) {
    $done({});
  }
}

if (!obj) {
  $done({});
}

// ===== 1. /fimo-user/user（核心VIP接口）=====
// 精确匹配 GET /fimo-user/user（不是/user/online, /user/sync）
// JSON结构: { "user":{...}, "films":[...], "subscribe":{ "valid":false, "forever":0, "endTime":0 } }
if (url.indexOf('/fimo-user/user') !== -1 && url.indexOf('/fimo-user/user/online') === -1 && url.indexOf('/fimo-user/user/sync') === -1) {
  // 设置VIP订阅
  obj.subscribe = obj.subscribe || {};
  obj.subscribe.valid = true;
  obj.subscribe.forever = 1;
  obj.subscribe.endTime = 4092599349000;

  // 已拥有的胶卷改为已购买
  if (obj.films && obj.films.length > 0) {
    for (var i = 0; i < obj.films.length; i++) {
      obj.films[i].pay = 'sync';
      obj.films[i].photo = 999;
    }
  }

  $done({body: JSON.stringify(obj)});
}

// ===== 2. /fimo-user/user/sync =====
if (url.indexOf('/fimo-user/user/sync') !== -1) {
  var target = obj.data || obj;
  if (target.subscribe) {
    target.subscribe.valid = true;
    target.subscribe.forever = 1;
    target.subscribe.endTime = 4092599349000;
  } else {
    target.subscribe = { valid: true, forever: 1, endTime: 4092599349000 };
  }
  $done({body: JSON.stringify(obj)});
}

// ===== 3. /fimo-user/user/online =====
if (url.indexOf('/fimo-user/user/online') !== -1) {
  $done({body: JSON.stringify(obj)});
}

// ===== 4. /fimo-common/filmAll（全部胶卷列表）=====
// JSON: [{ "special":"vip", "isPurchase":1, "price":"3", ... }]
if (url.indexOf('/fimo-common/filmAll') !== -1) {
  if (obj && obj.length > 0) {
    for (var i = 0; i < obj.length; i++) {
      obj[i].special = 'free';
      obj[i].isPurchase = 0;
      obj[i].price = '0';
      obj[i].status = 1;
    }
  }
  $done({body: JSON.stringify(obj)});
}

// ===== 5. /fimo-common/film（用户已拥有的胶卷列表）=====
if (url.indexOf('/fimo-common/film') !== -1) {
  // 透传，不需要修改
  $done({body: JSON.stringify(obj)});
}

// ===== 6. /fimo-common/subscribeConfig（订阅配置 - 价格改0）=====
if (url.indexOf('/fimo-common/subscribeConfig') !== -1) {
  if (obj && obj.productList) {
    for (var i = 0; i < obj.productList.length; i++) {
      obj.productList[i].price = '0.01';
      obj.productList[i].confirmText = '免费';
    }
  }
  $done({body: JSON.stringify(obj)});
}

// ===== 7. /fimo-common/subscribeSimpleConfig =====
if (url.indexOf('/fimo-common/subscribeSimpleConfig') !== -1) {
  $done({body: JSON.stringify(obj)});
}

// ===== 8. /fimo-common/apple/certificate（收据验证）=====
if (url.indexOf('/apple/certificate') !== -1) {
  obj.status = 0;
  obj.isVip = true;
  obj.subscribe = obj.subscribe || {};
  obj.subscribe.valid = true;
  obj.subscribe.forever = 1;
  obj.subscribe.endTime = 4092599349000;
  if (obj.data) {
    obj.data.isVip = true;
    obj.data.vip = true;
    obj.data.valid = true;
    obj.data.forever = 1;
    obj.data.endTime = 4092599349000;
    obj.data.vipExpire = 4092599349000;
    obj.data.expiration_date = '2099-12-31';
    obj.data.is_trial_period = false;
    obj.data.is_in_intro_offer_period = false;
    obj.data.cancellation_date = null;
  }
  $done({body: JSON.stringify(obj)});
}

// ===== 9. /fimo-common/apple/purchase（购买处理）=====
if (url.indexOf('/apple/purchase') !== -1) {
  obj.status = 0;
  obj.isVip = true;
  obj.subscribe = obj.subscribe || {};
  obj.subscribe.valid = true;
  obj.subscribe.forever = 1;
  obj.subscribe.endTime = 4092599349000;
  if (obj.data) {
    obj.data.isVip = true;
    obj.data.vip = true;
    obj.data.valid = true;
    obj.data.forever = 1;
    obj.data.endTime = 4092599349000;
  }
  $done({body: JSON.stringify(obj)});
}

// ===== 10. /fimo-common/config（配置）=====
if (url.indexOf('/fimo-common/config') !== -1) {
  $done({body: JSON.stringify(obj)});
}

// ===== 11. /fimo-common/startPopConfig（启动弹窗）=====
if (url.indexOf('/fimo-common/startPopConfig') !== -1) {
  $done({body: JSON.stringify(obj)});
}

// ===== 12. /fimo-common/sysconfig =====
if (url.indexOf('/fimo-common/sysconfig') !== -1) {
  $done({body: JSON.stringify(obj)});
}

// ===== 兜底 =====
$done({});
