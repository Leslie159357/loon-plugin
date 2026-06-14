// ==Quantumult X==
// @name         Doka Pro Unlock
// @description  解锁 Doka Pro VIP + AI 构图无限使用
// @version      2.0
// @author       Minis
// ==/Quantumult X==

var url = $request.url;
var body = $response.body;

// 只处理 Doka API
if (url.indexOf('www.yindoka.com') < 0) {
  $done({});
  return;
}

if (!body) {
  $done({});
  return;
}

try {
  var obj = JSON.parse(body);
} catch(e) {
  $done({});
  return;
}

// ===== 通用递归修改：把所有 VIP 字段都改了 =====
function setVipTrue(o) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) {
    for (var i = 0; i < o.length; i++) { 
      if (o[i] && typeof o[i] === 'object') setVipTrue(o[i]); 
    }
    return;
  }
  var keys = Object.keys(o);
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    var val = o[key];
    var kl = key.toLowerCase();
    
    // Boolean → true
    if (typeof val === 'boolean' && 
        ['is_vip','isvip','vip','ispro','ispremium','issubscribed',
         'subscribed','active','isenabled','hassubscription',
         'auto_renew_status','istrialperiod','is_trial_period'].indexOf(kl) >= 0) {
      o[key] = true;
    }
    
    // 字符串
    if (typeof val === 'string') {
      if (kl === 'vip_type' || kl === 'membertype' || kl === 'producttier') {
        o[key] = 'pro';
      }
      if (kl === 'status' || kl === 'state') {
        var freeVals = ['free','none','trial','expired','inactive','free_user','cancelled','canceled'];
        for (var f = 0; f < freeVals.length; f++) {
          if (val.toLowerCase() === freeVals[f]) {
            o[key] = 'active';
            break;
          }
        }
      }
      if (kl === 'product_id' && (val === '' || val === null || val === undefined)) {
        o[key] = 'com.ydgn.dokacamera.year.beimei';
      }
      if (['expire_time','expiretime','expiry_date','expirydate',
           'expires_date','expiresat'].indexOf(kl) >= 0 &&
          (val === '' || val === '0001-01-01T00:00:00Z' || val === null)) {
        o[key] = '2099-12-31T23:59:59Z';
      }
    }
    
    // 数字
    if (typeof val === 'number') {
      if (['remaining_count','remainingcomposecount','remainingfiltercount',
           'freeusecount','freeuse','remaining','remaininguses',
           'remaining_use','remaining_uses'].indexOf(kl) >= 0) {
        o[key] = 999999;
      }
    }
    
    // 递归
    if (val && typeof val === 'object') {
      setVipTrue(val);
    }
  }
}

// ===== 执行修改 =====
setVipTrue(obj);

// ===== 精确覆盖已知字段 =====
if (obj.data) {
  // 所有接口的 data 都覆盖
  obj.data.is_vip = true;
  
  if (obj.data.vip_type) {
    obj.data.vip_type = 'pro';
  }
  
  if (obj.data.expire_time !== undefined || obj.data.expires_date !== undefined) {
    obj.data.expire_time = '2099-12-31T23:59:59Z';
    obj.data.expires_date = '2099-12-31T23:59:59Z';
  }
  
  if (obj.data.remaining_count !== undefined) obj.data.remaining_count = 999999;
  if (obj.data.remaining_compose_count !== undefined) obj.data.remaining_compose_count = 999999;
  if (obj.data.remaining_filter_count !== undefined) obj.data.remaining_filter_count = 999999;
  if (obj.data.status !== undefined) obj.data.status = 'active';
  if (obj.data.product_id !== undefined) obj.data.product_id = 'com.ydgn.dokacamera.year.beimei';
  if (obj.data.auto_renew_status !== undefined) obj.data.auto_renew_status = true;
  if (obj.data.is_trial_period !== undefined) obj.data.is_trial_period = false;
  if (obj.data.environment !== undefined) obj.data.environment = 'Production';
}

// ===== ai_camera/v2 特殊处理 =====
// 如果 code≠0 且是 ai_camera 错误（次数用完），改为成功
if (obj.code !== undefined && obj.code !== 0 && 
    (url.indexOf('/ai_camera') >= 0 || url.indexOf('/ai_camera/v2') >= 0)) {
  obj.code = 0;
  obj.message = 'succ';
  if (!obj.data) {
    obj.data = {};
  }
}

// ===== validate-receipt 特殊处理 =====
if (url.indexOf('/validate-receipt') >= 0 && obj.code && obj.code !== 0) {
  obj.code = 0;
  obj.message = 'succ';
  if (!obj.data) {
    obj.data = {};
  }
  obj.data.is_vip = true;
  obj.data.vip_type = 'pro';
  obj.data.expire_time = '2099-12-31T23:59:59Z';
  obj.data.status = 'active';
  obj.data.product_id = 'com.ydgn.dokacamera.year.beimei';
  obj.data.auto_renew_status = true;
  obj.data.is_trial_period = false;
  obj.data.environment = 'Production';
}

$done({body: JSON.stringify(obj)});
